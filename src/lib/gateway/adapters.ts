import type {
  GatewayAgentRow,
  GatewayCronJob,
  GatewaySessionRow,
  GatewayChannelStatus,
  GatewayHealthResponse,
  GatewayLogEntry,
  PresenceEntry,
} from './types';
import type {
  Agent,
  AgentStatus,
  AgentSession,
  CronJob,
  CronStatus,
  ScheduleType,
  Channel,
  ChannelType,
  ChannelStatus,
  Gateway,
  GatewayStatus,
  LogEntry,
  LogLevel,
  LogSource,
} from '@/types';

// ---------------------------------------------------------------------------
// Agent adapter
// ---------------------------------------------------------------------------

export function adaptAgent(
  row: GatewayAgentRow,
  sessions: GatewaySessionRow[],
  presence?: PresenceEntry,
): Agent {
  const agentSessions = sessions.filter((s) => s.agentId === row.id);
  const activeSessions = agentSessions.filter((s) => s.status === 'active').length;

  let status: AgentStatus = 'offline';
  if (presence?.online) {
    status = activeSessions > 0 ? 'active' : 'idle';
  } else if (activeSessions > 0) {
    status = 'active';
  }

  const inputTokens = agentSessions.reduce((sum, s) => sum + (s.inputTokens ?? 0), 0);
  const outputTokens = agentSessions.reduce((sum, s) => sum + (s.outputTokens ?? 0), 0);
  const totalTokens = agentSessions.reduce((sum, s) => sum + (s.totalTokens ?? 0), 0);
  const costTotal = agentSessions.reduce((sum, s) => sum + (s.cost ?? 0), 0);

  const lastSessionUpdate = agentSessions.reduce(
    (max, s) => Math.max(max, s.updatedAt ?? 0),
    0,
  );

  return {
    id: row.id,
    name: row.identity?.name ?? row.name ?? row.id,
    model: row.model ?? 'unknown',
    status,
    description: row.description ?? '',
    avatar: row.identity?.avatarUrl ?? row.identity?.avatar ?? '/avatars/default.png',
    tokenUsage: { prompt: inputTokens, completion: outputTokens, total: totalTokens },
    costTotal,
    activeSessions,
    lastActive: lastSessionUpdate
      ? new Date(lastSessionUpdate).toISOString()
      : new Date().toISOString(),
    tasks: [],
    createdAt: row.createdAtMs
      ? new Date(row.createdAtMs).toISOString()
      : new Date().toISOString(),
    updatedAt: row.updatedAtMs
      ? new Date(row.updatedAtMs).toISOString()
      : new Date().toISOString(),
    vibe: row.vibe,
    soul: row.soul,
    workspace: row.workspace,
    sandbox: row.sandbox
      ? { mode: row.sandbox.mode as Agent['sandbox'] extends infer S ? S extends { mode: infer M } ? M : never : never, scope: row.sandbox.scope as Agent['sandbox'] extends infer S ? S extends { scope: infer SC } ? SC : never : never }
      : undefined,
    fallbackModels: row.fallbackModels,
    heartbeat: row.heartbeat,
    bindings: row.bindings?.map((b) => ({
      channel: b.channel as Agent['bindings'] extends (infer B)[] | undefined ? B extends { channel: infer C } ? C : never : never,
      accountId: b.accountId,
      peerId: b.peerId,
    })),
  };
}

// ---------------------------------------------------------------------------
// Session adapter
// ---------------------------------------------------------------------------

export function adaptSession(row: GatewaySessionRow): AgentSession {
  return {
    id: row.key,
    agentId: row.agentId ?? '',
    status: (row.status as AgentSession['status']) ?? 'active',
    startedAt: row.startedAtMs
      ? new Date(row.startedAtMs).toISOString()
      : new Date().toISOString(),
    endedAt: row.endedAtMs ? new Date(row.endedAtMs).toISOString() : undefined,
    tokensUsed: row.totalTokens ?? 0,
    cost: row.cost ?? 0,
  };
}

// ---------------------------------------------------------------------------
// Cron adapter
// ---------------------------------------------------------------------------

export function adaptCronJob(row: GatewayCronJob): CronJob {
  let status: CronStatus;
  if (!row.enabled) {
    status = 'paused';
  } else if (row.state.lastRunStatus === 'running') {
    status = 'running';
  } else if (row.state.lastRunStatus === 'error') {
    status = 'failed';
  } else {
    status = 'active';
  }

  let expression: string;
  if (row.schedule.kind === 'cron' && row.schedule.expr) {
    expression = row.schedule.expr;
  } else if (row.schedule.kind === 'interval' && row.schedule.everyMs) {
    expression = `every ${row.schedule.everyMs}ms`;
  } else if (row.schedule.kind === 'once' && row.schedule.runAt) {
    expression = `once at ${row.schedule.runAt}`;
  } else {
    expression = row.schedule.expr ?? '* * * * *';
  }

  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    expression,
    status,
    lastRun: row.state.lastRunAtMs
      ? new Date(row.state.lastRunAtMs).toISOString()
      : undefined,
    nextRun: row.state.nextRunAtMs
      ? new Date(row.state.nextRunAtMs).toISOString()
      : new Date().toISOString(),
    runCount: row.state.runCount ?? 0,
    failCount: row.state.failCount ?? 0,
    createdAt: new Date(row.createdAtMs).toISOString(),
    agentId: row.payload.agentId,
    scheduleType: row.schedule.kind as ScheduleType,
    intervalMs: row.schedule.everyMs,
    runAt: row.schedule.runAt,
    sessionType: row.payload.sessionType,
    prompt: row.payload.prompt,
    model: row.payload.model,
    deliveryMode: row.delivery?.mode as CronJob['deliveryMode'],
    deliveryChannel: row.delivery?.channel as CronJob['deliveryChannel'],
    webhookUrl: row.delivery?.webhookUrl,
    timeout: row.timeout,
    maxRetries: row.maxRetries,
    timezone: row.timezone,
    deleteAfterRun: row.deleteAfterRun,
    lightContext: row.lightContext,
  };
}

// ---------------------------------------------------------------------------
// Channel adapter
// ---------------------------------------------------------------------------

export function adaptChannel(row: GatewayChannelStatus): Channel {
  return {
    id: row.id,
    name: row.name,
    type: row.type as ChannelType,
    status: row.status as ChannelStatus,
    connectedAt: row.connectedAt
      ? new Date(row.connectedAt).toISOString()
      : new Date().toISOString(),
    messageCount: row.messageCount ?? 0,
  };
}

// ---------------------------------------------------------------------------
// Gateway / Health adapter
// ---------------------------------------------------------------------------

export function adaptHealth(
  health: GatewayHealthResponse,
  connectionState: string,
  url: string,
): Gateway {
  const statusMap: Record<string, GatewayStatus> = {
    connected: 'connected',
    connecting: 'connecting',
    authenticating: 'connecting',
    reconnecting: 'connecting',
    disconnected: 'disconnected',
  };

  return {
    id: 'gw-live',
    url,
    status: statusMap[connectionState] ?? 'disconnected',
    uptime: health.uptime ?? 0,
    connectedAt: health.uptime
      ? new Date(Date.now() - health.uptime * 1000).toISOString()
      : undefined,
    version: health.version ?? 'unknown',
    resources: {
      cpu: health.resources?.cpu ?? 0,
      memory: health.resources?.memory ?? { used: 0, total: 0 },
      disk: health.resources?.disk ?? { used: 0, total: 0 },
      network: health.resources?.network ?? { in: 0, out: 0 },
    },
  };
}

// ---------------------------------------------------------------------------
// Log adapter
// ---------------------------------------------------------------------------

export function adaptLogEntry(row: GatewayLogEntry): LogEntry {
  return {
    id: row.id,
    level: row.level as LogLevel,
    source: row.source as LogSource,
    message: row.message,
    timestamp: new Date(row.timestamp).toISOString(),
    agentId: row.agentId,
    metadata: row.metadata,
    stackTrace: row.stackTrace,
  };
}

// ---------------------------------------------------------------------------
// Reverse adapters (frontend → backend)
// ---------------------------------------------------------------------------

export function toBackendCronCreate(formData: Partial<CronJob>): Record<string, unknown> {
  return {
    name: formData.name,
    description: formData.description,
    enabled: formData.status !== 'paused',
    schedule: {
      kind: formData.scheduleType ?? 'cron',
      expr: formData.scheduleType === 'cron' ? formData.expression : undefined,
      everyMs: formData.scheduleType === 'interval' ? formData.intervalMs : undefined,
      runAt: formData.scheduleType === 'once' ? formData.runAt : undefined,
    },
    payload: {
      agentId: formData.agentId,
      prompt: formData.prompt,
      model: formData.model,
      sessionType: formData.sessionType,
    },
    delivery: formData.deliveryMode
      ? {
          mode: formData.deliveryMode,
          channel: formData.deliveryChannel,
          webhookUrl: formData.webhookUrl,
        }
      : undefined,
    timeout: formData.timeout,
    maxRetries: formData.maxRetries,
    timezone: formData.timezone,
    deleteAfterRun: formData.deleteAfterRun,
    lightContext: formData.lightContext,
  };
}

export function toBackendAgentCreate(formData: Partial<Agent>): Record<string, unknown> {
  return {
    name: formData.name,
    model: formData.model,
    description: formData.description,
    identity: {
      name: formData.name,
      avatar: formData.avatar,
    },
    vibe: formData.vibe,
    soul: formData.soul,
    workspace: formData.workspace,
    sandbox: formData.sandbox,
    fallbackModels: formData.fallbackModels,
    heartbeat: formData.heartbeat,
    bindings: formData.bindings,
  };
}
