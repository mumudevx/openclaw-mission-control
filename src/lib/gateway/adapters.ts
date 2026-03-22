import type {
  GatewayAgentRow,
  GatewayCronJob,
  GatewaySessionRow,
  GatewayHealthResponse,
  GatewayLogEntry,
  PresenceEntry,
  ChannelsStatusResponse,
  ChannelAccountSnapshot,
  ChannelMetaEntry,
  ServerInfo,
  Snapshot,
} from './types';
import type {
  Agent,
  AgentStatus,
  AgentSession,
  AgentSessionStatus,
  CronJob,
  CronStatus,
  ScheduleType,
  Channel,
  ChannelType,
  ChannelStatus,
  Gateway,
  GatewayStatus,
  GatewayStats,
  LogEntry,
  LogLevel,
  LogSource,
} from '@/types';

// ---------------------------------------------------------------------------
// Agent adapter
// ---------------------------------------------------------------------------

/** Parse agent ID from session key like "agent:main:sender123" */
function agentIdFromSessionKey(key: string): string | undefined {
  const parts = key.split(':');
  return parts.length >= 2 ? parts[1] : undefined;
}

export function adaptAgent(
  row: GatewayAgentRow,
  defaultId: string | undefined,
  sessions: GatewaySessionRow[],
  presence?: PresenceEntry,
): Agent {
  const agentSessions = sessions.filter(
    (s) => agentIdFromSessionKey(s.key) === row.id,
  );

  const runningSessions = agentSessions.filter((s) => s.status === 'running').length;

  let status: AgentStatus = 'offline';
  if (presence?.online) {
    status = runningSessions > 0 ? 'active' : 'idle';
  } else if (runningSessions > 0) {
    status = 'active';
  }

  const totalTokens = agentSessions.reduce((sum, s) => sum + (s.totalTokens ?? 0), 0);
  const estimatedCost = agentSessions.reduce((sum, s) => sum + (s.estimatedCostUsd ?? 0), 0);

  const lastSessionUpdate = agentSessions.reduce(
    (max, s) => Math.max(max, s.updatedAt ?? 0),
    0,
  );

  return {
    id: row.id,
    name: row.identity?.name ?? row.name ?? row.id,
    isDefault: row.id === defaultId,
    identity: row.identity,
    sessionCount: agentSessions.length,
    totalTokens,
    estimatedCost,
    lastActive: lastSessionUpdate
      ? new Date(lastSessionUpdate).toISOString()
      : undefined,
    status,
  };
}

// ---------------------------------------------------------------------------
// Session adapter
// ---------------------------------------------------------------------------

export function adaptSession(row: GatewaySessionRow): AgentSession {
  return {
    key: row.key,
    agentId: agentIdFromSessionKey(row.key),
    kind: row.kind,
    displayName: row.displayName ?? row.label,
    channel: row.channel,
    model: row.model,
    status: (row.status as AgentSessionStatus) ?? undefined,
    updatedAt: row.updatedAt,
    inputTokens: row.inputTokens,
    outputTokens: row.outputTokens,
    totalTokens: row.totalTokens,
    estimatedCostUsd: row.estimatedCostUsd,
    startedAt: row.startedAt,
    endedAt: row.endedAt,
    runtimeMs: row.runtimeMs,
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

export function adaptChannelsFromStatus(response: ChannelsStatusResponse): Channel[] {
  const meta = response.channelMeta ?? [];
  const accounts = response.channelAccounts ?? {};
  const channelSummaries = response.channels ?? {};

  return meta.map((m: ChannelMetaEntry) => {
    const accts = accounts[m.id] ?? [];
    const summary = channelSummaries[m.id] as Record<string, unknown> | undefined;
    const firstAcct: ChannelAccountSnapshot | undefined = accts[0];

    const isRunning = firstAcct?.running ?? summary?.running === true;
    const isConnected = firstAcct?.connected ?? summary?.connected === true;

    return {
      id: m.id,
      name: m.label,
      type: m.id as ChannelType,
      status: (isRunning || isConnected ? 'active' : 'inactive') as ChannelStatus,
      connectedAt: firstAcct?.lastStartAt
        ? new Date(firstAcct.lastStartAt).toISOString()
        : new Date().toISOString(),
      messageCount: 0,
    };
  });
}

// ---------------------------------------------------------------------------
// Gateway / Health adapter
// ---------------------------------------------------------------------------

export function adaptHealth(
  health: GatewayHealthResponse,
  connectionState: string,
  url: string,
  serverInfo?: ServerInfo | null,
  snapshot?: Snapshot | null,
): Gateway {
  const statusMap: Record<string, GatewayStatus> = {
    connected: 'connected',
    connecting: 'connecting',
    authenticating: 'connecting',
    reconnecting: 'connecting',
    disconnected: 'disconnected',
  };

  const channelCount = health.channelOrder?.length
    ?? (health.channels ? Object.keys(health.channels).length : 0);

  const uptimeMs = snapshot?.uptimeMs ?? health.uptime ?? 0;

  const stats: GatewayStats = {
    agentCount: health.agents?.length ?? 0,
    sessionCount: health.sessions?.count ?? 0,
    channelCount,
    heartbeatSeconds: health.heartbeatSeconds ?? 0,
  };

  return {
    id: 'gw-live',
    url,
    status: statusMap[connectionState] ?? 'disconnected',
    uptime: uptimeMs,
    connectedAt: uptimeMs
      ? new Date(Date.now() - uptimeMs).toISOString()
      : undefined,
    version: serverInfo?.version ?? health.version ?? 'unknown',
    stats,
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

export function toBackendAgentCreate(formData: {
  name: string;
  workspace: string;
  emoji?: string;
  avatar?: string;
}): Record<string, unknown> {
  return {
    name: formData.name,
    workspace: formData.workspace,
    ...(formData.emoji && { emoji: formData.emoji }),
    ...(formData.avatar && { avatar: formData.avatar }),
  };
}

export function toBackendAgentUpdate(formData: {
  agentId: string;
  name?: string;
  workspace?: string;
  model?: string;
  avatar?: string;
}): Record<string, unknown> {
  return {
    agentId: formData.agentId,
    ...(formData.name && { name: formData.name }),
    ...(formData.workspace && { workspace: formData.workspace }),
    ...(formData.model && { model: formData.model }),
    ...(formData.avatar && { avatar: formData.avatar }),
  };
}
