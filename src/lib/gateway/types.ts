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
  version: string;
  connId?: string;
}

export interface Features {
  [key: string]: boolean;
}

export interface Snapshot {
  presence?: Record<string, PresenceEntry>;
  uptimeMs?: number;
  [key: string]: unknown;
}

export interface PresenceEntry {
  online: boolean;
  lastSeen?: number;
  activeSessions?: number;
}

export interface Policy {
  maxRequestsPerMinute?: number;
}

export interface AuthInfo {
  authenticated: boolean;
  role?: string;
}

// Valid gateway client identifiers (from openclaw gateway protocol)
export type GatewayClientId =
  | 'webchat-ui'
  | 'openclaw-control-ui'
  | 'webchat'
  | 'cli'
  | 'gateway-client'
  | 'openclaw-macos'
  | 'openclaw-ios'
  | 'openclaw-android'
  | 'node-host'
  | 'test'
  | 'fingerprint'
  | 'openclaw-probe';

// Valid gateway client modes (from openclaw gateway protocol)
export type GatewayClientMode =
  | 'webchat'
  | 'cli'
  | 'ui'
  | 'backend'
  | 'node'
  | 'probe'
  | 'test';

// Current gateway protocol version
export const GATEWAY_PROTOCOL_VERSION = 3;

// ConnectParams (client → server after challenge)
export interface ConnectParams {
  minProtocol: number;
  maxProtocol: number;
  client: {
    id: GatewayClientId;
    version: string;
    platform: string;
    mode: GatewayClientMode;
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
  identity?: {
    name?: string;
    theme?: string;
    emoji?: string;
    avatar?: string;
    avatarUrl?: string;
  };
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
  kind: 'direct' | 'group' | 'global' | 'unknown';
  label?: string;
  displayName?: string;
  channel?: string;
  subject?: string;
  model?: string;
  modelProvider?: string;
  updatedAt: number | null;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  estimatedCostUsd?: number;
  status?: string;
  startedAt?: number;
  endedAt?: number;
  runtimeMs?: number;
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
  ts?: number;
  durationMs?: number;
  channels?: Record<string, unknown>;
  channelOrder?: string[];
  channelLabels?: Record<string, string>;
  heartbeatSeconds?: number;
  defaultAgentId?: string;
  agents?: Array<{
    agentId: string;
    name?: string;
    isDefault: boolean;
    heartbeat?: unknown;
    sessions?: { path: string; count: number };
  }>;
  sessions?: {
    path: string;
    count: number;
    recent?: Array<{ key: string; updatedAt: number | null; age: number | null }>;
  };
  // Fields from snapshot (sent on initial connect)
  version?: string;
  uptime?: number;
}

export interface GatewayUsageStatus {
  totalTokens: number;
  totalCost: number;
  todayTokens: number;
  todayCost: number;
}

// RPC list response wrappers (gateway wraps arrays in objects)
export interface AgentsListResponse {
  agents: GatewayAgentRow[];
  defaultId?: string;
  mainKey?: string;
  scope?: string;
}

export interface SessionsListResponse {
  ts?: number;
  count?: number;
  sessions: GatewaySessionRow[];
}

export interface CronListResponse {
  jobs: GatewayCronJob[];
  total?: number;
  hasMore?: boolean;
}

export interface LogsTailResponse {
  entries: GatewayLogEntry[];
}

export interface ChannelAccountSnapshot {
  accountId: string;
  enabled?: boolean | null;
  configured?: boolean | null;
  running?: boolean | null;
  connected?: boolean | null;
  lastStartAt?: number | null;
  lastStopAt?: number | null;
  lastError?: string | null;
  lastInboundAt?: number | null;
  lastOutboundAt?: number | null;
  mode?: string | null;
}

export interface ChannelMetaEntry {
  id: string;
  label: string;
  detailLabel?: string;
  systemImage?: string;
}

export interface ChannelsStatusResponse {
  ts: number;
  channelOrder?: string[];
  channelLabels?: Record<string, string>;
  channelMeta?: ChannelMetaEntry[];
  channels?: Record<string, Record<string, unknown>>;
  channelAccounts?: Record<string, ChannelAccountSnapshot[]>;
  channelDefaultAccountId?: Record<string, string>;
}

// Skills RPC responses
export interface SkillStatusEntry {
  name: string;
  description: string;
  source: string;
  bundled: boolean;
  emoji?: string;
  homepage?: string;
  primaryEnv?: string;
  always: boolean;
  disabled: boolean;
  blockedByAllowlist: boolean;
  eligible: boolean;
  requirements: { bins?: string[]; envVars?: string[]; anyBins?: string[] };
  missing: { bins?: string[]; envVars?: string[]; anyBins?: string[] };
}

export interface SkillsStatusResponse {
  workspaceDir: string;
  managedSkillsDir: string;
  skills: SkillStatusEntry[];
}

export interface SkillsInstallResponse {
  ok: boolean;
  message: string;
}

export interface SkillsUpdateResponse {
  ok: boolean;
  skillKey: string;
  config: {
    enabled?: boolean;
    apiKey?: string;
    env?: Record<string, string>;
  };
}

// Agent file RPC responses
export interface AgentFilesListResponse {
  files: Array<{
    name: string;
    path: string;
    size: number;
    updatedAtMs: number;
    missing: boolean;
  }>;
}

export interface AgentFileGetResponse {
  agentId: string;
  workspace: string;
  file: {
    name: string;
    path: string;
    missing: boolean;
    size: number;
    updatedAtMs: number;
    content: string;
  };
}

export interface AgentFileSetResponse {
  ok: boolean;
}

export interface AgentCreateResponse {
  ok: boolean;
  agentId: string;
  name: string;
  workspace: string;
}

// Connection state for the client
export type ConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'authenticating'
  | 'connected'
  | 'reconnecting';
