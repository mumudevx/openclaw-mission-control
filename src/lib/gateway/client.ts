import type {
  ConnectionState,
  ConnectParams,
  Frame,
  HelloOkFrame,
  ReqFrame,
  ResFrame,
  Snapshot,
  ServerInfo,
} from './types';

type EventCallback = (payload: unknown) => void;
type StateCallback = (state: ConnectionState) => void;

interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (reason: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

export class GatewayClient {
  private url = '';
  private token = '';
  private socket: WebSocket | null = null;
  private _state: ConnectionState = 'disconnected';
  private listeners = new Map<string, Set<EventCallback>>();
  private stateListeners = new Set<StateCallback>();
  private pending = new Map<string, PendingRequest>();
  private reconnectAttempts = 0;
  private maxReconnectDelay = 30_000;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private rpcTimeout = 30_000;
  private idCounter = 0;

  private _snapshot: Snapshot = {};
  private _serverInfo: ServerInfo | null = null;

  get state(): ConnectionState {
    return this._state;
  }

  get snapshot(): Snapshot {
    return this._snapshot;
  }

  get serverInfo(): ServerInfo | null {
    return this._serverInfo;
  }

  configure(opts: { url: string; token: string }): void {
    this.url = opts.url;
    this.token = opts.token;
  }

  connect(): void {
    if (this._state === 'connected' || this._state === 'connecting') {
      return;
    }

    this.setState('connecting');

    try {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        // Wait for connect.challenge event from server
      };

      this.socket.onmessage = (event: MessageEvent) => {
        try {
          const frame = JSON.parse(event.data as string) as Frame;
          this.handleFrame(frame);
        } catch {
          // Ignore malformed frames
        }
      };

      this.socket.onclose = () => {
        this.socket = null;
        if (this._state !== 'disconnected') {
          this.scheduleReconnect();
        }
      };

      this.socket.onerror = () => {
        // onclose will fire after onerror
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    this.setState('disconnected');
    this.clearReconnectTimer();
    this.reconnectAttempts = 0;

    // Reject all pending requests
    for (const [id, req] of this.pending) {
      clearTimeout(req.timer);
      req.reject(new Error('Client disconnected'));
      this.pending.delete(id);
    }

    if (this.socket) {
      this.socket.onclose = null;
      this.socket.close();
      this.socket = null;
    }
  }

  async rpc<P = unknown, R = unknown>(method: string, params?: P): Promise<R> {
    if (this._state !== 'connected') {
      throw new Error(`Cannot send RPC: client is ${this._state}`);
    }

    const id = this.nextId();
    const frame: ReqFrame = { type: 'req', id, method };
    if (params !== undefined) {
      frame.params = params;
    }

    return new Promise<R>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`RPC timeout: ${method} (${id})`));
      }, this.rpcTimeout);

      this.pending.set(id, {
        resolve: resolve as (v: unknown) => void,
        reject,
        timer,
      });

      this.socket!.send(JSON.stringify(frame));
    });
  }

  on(event: string, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      const set = this.listeners.get(event);
      if (set) {
        set.delete(callback);
        if (set.size === 0) this.listeners.delete(event);
      }
    };
  }

  onStateChange(callback: StateCallback): () => void {
    this.stateListeners.add(callback);
    return () => {
      this.stateListeners.delete(callback);
    };
  }

  // --- Private ---

  private handleFrame(frame: Frame): void {
    switch (frame.type) {
      case 'event':
        if (frame.event === 'connect.challenge') {
          this.handleChallenge();
        } else {
          this.notifyEvent(frame.event, frame.payload);
        }
        break;

      case 'hello-ok':
        this.handleHelloOk(frame);
        break;

      case 'res':
        this.handleResponse(frame);
        break;
    }
  }

  private handleChallenge(): void {
    this.setState('authenticating');

    const connectParams: ConnectParams = {
      minProtocol: 1,
      maxProtocol: 1,
      client: {
        id: 'mission-control',
        version: '1.0.0',
        platform: 'web',
        mode: 'operator',
      },
    };

    if (this.token) {
      connectParams.auth = { token: this.token };
    }

    // Send connect request
    const id = this.nextId();
    const frame: ReqFrame = { type: 'req', id, method: 'connect', params: connectParams };
    this.socket?.send(JSON.stringify(frame));

    // The response will come as hello-ok or res with error
    const timer = setTimeout(() => {
      this.pending.delete(id);
      this.disconnect();
    }, this.rpcTimeout);

    this.pending.set(id, {
      resolve: () => { /* handled via hello-ok */ },
      reject: (err) => {
        console.error('Auth failed:', err);
        this.disconnect();
      },
      timer,
    });
  }

  private handleHelloOk(frame: HelloOkFrame): void {
    // Clear the connect pending request
    for (const [id, req] of this.pending) {
      clearTimeout(req.timer);
      this.pending.delete(id);
      break; // Only the first (connect) request
    }

    this._serverInfo = frame.server;
    this._snapshot = frame.snapshot ?? {};
    this.reconnectAttempts = 0;
    this.setState('connected');
  }

  private handleResponse(frame: ResFrame): void {
    const req = this.pending.get(frame.id);
    if (!req) return;

    clearTimeout(req.timer);
    this.pending.delete(frame.id);

    if (frame.ok) {
      req.resolve(frame.payload);
    } else {
      const errMsg = frame.error?.message ?? 'RPC error';
      req.reject(new Error(errMsg));
    }
  }

  private setState(state: ConnectionState): void {
    this._state = state;
    for (const cb of this.stateListeners) {
      try {
        cb(state);
      } catch {
        // Prevent listener errors from breaking the loop
      }
    }
  }

  private notifyEvent(event: string, payload: unknown): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      for (const cb of callbacks) {
        try {
          cb(payload);
        } catch {
          // Prevent listener errors from breaking the loop
        }
      }
    }
  }

  private scheduleReconnect(): void {
    this.setState('reconnecting');
    this.clearReconnectTimer();

    const delay = Math.min(
      1000 * Math.pow(2, this.reconnectAttempts),
      this.maxReconnectDelay,
    );
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private nextId(): string {
    this.idCounter++;
    return `mc-${this.idCounter}-${Date.now().toString(36)}`;
  }
}
