type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';
type EventCallback = (data: unknown) => void;

class WebSocketClient {
  private url: string;
  private mockMode: boolean;
  private socket: WebSocket | null = null;
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectDelay = 30_000;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private _state: ConnectionState = 'disconnected';

  constructor(url?: string) {
    this.url = url ?? process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:3100/ws';
    this.mockMode = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';
  }

  get state(): ConnectionState {
    return this._state;
  }

  private setState(state: ConnectionState): void {
    this._state = state;
    this.notify('connection_state', state);
  }

  connect(): void {
    if (this.mockMode) {
      this.setState('connected');
      return;
    }

    if (this._state === 'connected' || this._state === 'connecting') {
      return;
    }

    this.setState('connecting');

    try {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        this.reconnectAttempts = 0;
        this.setState('connected');
      };

      this.socket.onmessage = (event: MessageEvent) => {
        try {
          const message = JSON.parse(event.data as string) as {
            event: string;
            data: unknown;
          };
          this.notify(message.event, message.data);
        } catch {
          // Ignore malformed messages
        }
      };

      this.socket.onclose = () => {
        this.socket = null;
        if (this._state !== 'disconnected') {
          this.scheduleReconnect();
        }
      };

      this.socket.onerror = () => {
        // onclose will fire after onerror, so reconnect is handled there
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    this.setState('disconnected');
    this.clearReconnectTimer();
    this.reconnectAttempts = 0;

    if (this.socket) {
      this.socket.onclose = null;
      this.socket.close();
      this.socket = null;
    }
  }

  on(event: string, callback: EventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: EventCallback): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  emit(event: string, data: unknown): void {
    if (this.mockMode) {
      // In mock mode, echo the event back to local listeners
      this.notify(event, data);
      return;
    }

    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ event, data }));
    }
  }

  private notify(event: string, data: unknown): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(data);
        } catch {
          // Prevent listener errors from breaking the event loop
        }
      });
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
}

export const wsClient = new WebSocketClient();
export { WebSocketClient };
export type { ConnectionState, EventCallback };
