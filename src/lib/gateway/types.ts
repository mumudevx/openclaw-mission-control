// ---------------------------------------------------------------------------
// OpenClaw Gateway Wire Protocol Types
// ---------------------------------------------------------------------------

// Frame types (discriminated union on "type")
export interface ReqFrame {
  type: 'req';
  id: string;
  method: string;
  params?: unknown;
}

export interface ResFrame {
  type: 'res';
  id: string;
  ok: boolean;
  payload?: unknown;
  error?: ErrorShape;
}

export interface EventFrame {
  type: 'event';
  event: string;
  payload?: unknown;
  seq?: number;
  stateVersion?: StateVersion;
}

export interface HelloOkFrame {
  type: 'hello-ok';
  protocol: number;
  server: ServerInfo;
  features: Features;
  snapshot: Snapshot;
  policy: Policy;
  auth?: AuthInfo;
}

export type Frame = ReqFrame | ResFrame | EventFrame | HelloOkFrame;

// Supporting types
export interface ErrorShape {
  code: string;
  message: string;
  details?: unknown;
}

export interface StateVersion {
  agents?: number;
  cron?: number;
  sessions?: number;
}

export interface ServerInfo {
  name: string;
  version: string;
  uptime?: number;
}

export interface Features {
  [key: string]: boolean;
}

export interface Snapshot {
  presence?: Record<string, PresenceEntry>;
  health?: HealthSnapshot;
}

export interface PresenceEntry {
  online: boolean;
  lastSeen?: number;
  activeSessions?: number;
}

export interface HealthSnapshot {
  ok: boolean;
  status: string;
  cpu?: number;
  memory?: { used: number; total: number };
  disk?: { used: number; total: number };
  network?: { in: number; out: number };
  uptime?: number;
}

export interface Policy {
  maxRequestsPerMinute?: number;
}

export interface AuthInfo {
  authenticated: boolean;
  role?: string;
}

// ConnectParams (client → server after challenge)
export interface ConnectParams {
  minProtocol: 1;
  maxProtocol: 1;
  client: {
    id: 'mission-control';
    version: string;
    platform: 'web';
    mode: 'operator';
  };
  auth?: {
    token?: string;
    password?: string;
  };
}

// ---------------------------------------------------------------------------
// Backend entity shapes (as returned by RPC)
// ---------------------------------------------------------------------------

export interface GatewayAgentRow {
  id: string;
  name?: string;
  model?: string;
  description?: string;
  identity?: {
    name?: string;
    emoji?: string;
    avatar?: string;
    avatarUrl?: string;
  };
  vibe?: string;
  soul?: string;
  workspace?: {
    userMd?: string;
    agentsMd?: string;
    toolsMd?: string;
  };
  sandbox?: {
    mode?: string;
    scope?: string;
  };
  fallbackModels?: string[];
  heartbeat?: {
    interval?: string;
    target?: string;
  };
  bindings?: Array<{
    channel: string;
    accountId?: string;
    peerId?: string;
  }>;
  createdAtMs?: number;
  updatedAtMs?: number;
}

export interface GatewayCronSchedule {
  kind: 'cron' | 'interval' | 'once';
  expr?: string;
  everyMs?: number;
  runAt?: string;
}

export interface GatewayCronPayload {
  agentId?: string;
  prompt?: string;
  model?: string;
  sessionType?: 'isolated' | 'main';
}

export interface GatewayCronDelivery {
  mode?: 'announce' | 'webhook' | 'none';
  channel?: string;
  webhookUrl?: string;
}

export interface GatewayCronJobState {
  lastRunAtMs?: number;
  lastRunStatus?: 'success' | 'error' | 'running';
  nextRunAtMs?: number;
  runCount?: number;
  failCount?: number;
}

export interface GatewayCronJob {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  schedule: GatewayCronSchedule;
  payload: GatewayCronPayload;
  delivery?: GatewayCronDelivery;
  state: GatewayCronJobState;
  timeout?: number;
  maxRetries?: number;
  timezone?: string;
  deleteAfterRun?: boolean;
  lightContext?: boolean;
  createdAtMs: number;
  updatedAtMs: number;
}

export interface GatewaySessionRow {
  key: string;
  label?: string;
  displayName?: string;
  channel?: string;
  agentId?: string;
  model?: string;
  updatedAt?: number;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  status?: string;
  cost?: number;
  startedAtMs?: number;
  endedAtMs?: number;
}

export interface GatewayChannelStatus {
  id: string;
  name: string;
  type: string;
  status: string;
  connectedAt?: number;
  messageCount?: number;
}

export interface GatewayLogEntry {
  id: string;
  level: string;
  source: string;
  message: string;
  timestamp: number;
  agentId?: string;
  metadata?: Record<string, unknown>;
  stackTrace?: string;
}

export interface GatewayHealthResponse {
  ok: boolean;
  status: string;
  version?: string;
  uptime?: number;
  resources?: {
    cpu?: number;
    memory?: { used: number; total: number };
    disk?: { used: number; total: number };
    network?: { in: number; out: number };
  };
}

export interface GatewayUsageStatus {
  totalTokens: number;
  totalCost: number;
  todayTokens: number;
  todayCost: number;
}

// Connection state for the client
export type ConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'authenticating'
  | 'connected'
  | 'reconnecting';
