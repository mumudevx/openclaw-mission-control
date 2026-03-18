import type {
  GatewayAgentRow,
  GatewayCronJob,
  GatewaySessionRow,
  GatewayChannelStatus,
  GatewayHealthResponse,
  GatewayUsageStatus,
  GatewayLogEntry,
} from './types';
import {
  mockAgents,
  mockCronJobs,
  mockAgentSessions,
  mockChannels,
  mockGateway,
  mockDashboardStats,
  generateMockLogs,
} from '@/lib/mock/data';

function toAgentRow(a: typeof mockAgents[0]): GatewayAgentRow {
  return {
    id: a.id,
    name: a.name,
    model: a.model,
    description: a.description,
    identity: { name: a.name, avatar: a.avatar },
    vibe: a.vibe,
    soul: a.soul,
    workspace: a.workspace,
    sandbox: a.sandbox ? { mode: a.sandbox.mode, scope: a.sandbox.scope } : undefined,
    fallbackModels: a.fallbackModels,
    heartbeat: a.heartbeat,
    bindings: a.bindings?.map((b) => ({ channel: b.channel, accountId: b.accountId, peerId: b.peerId })),
    createdAtMs: new Date(a.createdAt).getTime(),
    updatedAtMs: new Date(a.updatedAt).getTime(),
  };
}

function toCronJob(j: typeof mockCronJobs[0]): GatewayCronJob {
  return {
    id: j.id,
    name: j.name,
    description: j.description,
    enabled: j.status !== 'paused',
    schedule: {
      kind: j.scheduleType ?? 'cron',
      expr: j.expression,
      everyMs: j.intervalMs,
      runAt: j.runAt,
    },
    payload: {
      agentId: j.agentId,
      prompt: j.prompt,
      model: j.model,
      sessionType: j.sessionType,
    },
    delivery: j.deliveryMode
      ? { mode: j.deliveryMode, channel: j.deliveryChannel, webhookUrl: j.webhookUrl }
      : undefined,
    state: {
      lastRunAtMs: j.lastRun ? new Date(j.lastRun).getTime() : undefined,
      lastRunStatus: j.status === 'failed' ? 'error' : j.status === 'running' ? 'running' : 'success',
      nextRunAtMs: new Date(j.nextRun).getTime(),
      runCount: j.runCount,
      failCount: j.failCount,
    },
    timeout: j.timeout,
    maxRetries: j.maxRetries,
    timezone: j.timezone,
    deleteAfterRun: j.deleteAfterRun,
    lightContext: j.lightContext,
    createdAtMs: new Date(j.createdAt).getTime(),
    updatedAtMs: new Date(j.createdAt).getTime(),
  };
}

function toSessionRow(s: typeof mockAgentSessions[0]): GatewaySessionRow {
  return {
    key: s.id,
    agentId: s.agentId,
    status: s.status,
    model: undefined,
    updatedAt: new Date(s.startedAt).getTime(),
    inputTokens: Math.floor(s.tokensUsed * 0.6),
    outputTokens: Math.floor(s.tokensUsed * 0.4),
    totalTokens: s.tokensUsed,
    cost: s.cost,
    startedAtMs: new Date(s.startedAt).getTime(),
    endedAtMs: s.endedAt ? new Date(s.endedAt).getTime() : undefined,
  };
}

function toChannelStatus(c: typeof mockChannels[0]): GatewayChannelStatus {
  return {
    id: c.id,
    name: c.name,
    type: c.type,
    status: c.status,
    connectedAt: new Date(c.connectedAt).getTime(),
    messageCount: c.messageCount,
  };
}

function toLogEntry(l: ReturnType<typeof generateMockLogs>[0]): GatewayLogEntry {
  return {
    id: l.id,
    level: l.level,
    source: l.source,
    message: l.message,
    timestamp: new Date(l.timestamp).getTime(),
    agentId: l.agentId,
    metadata: l.metadata,
    stackTrace: l.stackTrace,
  };
}

const handlers: Record<string, (params?: unknown) => Promise<unknown>> = {
  'agents.list': async (): Promise<GatewayAgentRow[]> => {
    return mockAgents.map(toAgentRow);
  },

  'agents.create': async (params): Promise<GatewayAgentRow> => {
    const p = params as Record<string, unknown>;
    const row: GatewayAgentRow = {
      id: `agent-${Date.now()}`,
      name: (p.name as string) ?? 'New Agent',
      model: p.model as string,
      description: p.description as string,
      createdAtMs: Date.now(),
      updatedAtMs: Date.now(),
    };
    return row;
  },

  'agents.update': async (params): Promise<GatewayAgentRow> => {
    const p = params as Record<string, unknown>;
    const existing = mockAgents.find((a) => a.id === p.id);
    return toAgentRow({ ...existing!, ...(p as Record<string, unknown>) } as typeof mockAgents[0]);
  },

  'agents.delete': async (): Promise<{ ok: boolean }> => {
    return { ok: true };
  },

  'sessions.list': async (): Promise<GatewaySessionRow[]> => {
    return mockAgentSessions.map(toSessionRow);
  },

  'cron.list': async (): Promise<GatewayCronJob[]> => {
    return mockCronJobs.map(toCronJob);
  },

  'cron.add': async (params): Promise<GatewayCronJob> => {
    const p = params as Record<string, unknown>;
    return {
      id: `cron-${Date.now()}`,
      name: (p.name as string) ?? 'New Job',
      description: p.description as string,
      enabled: true,
      schedule: (p.schedule as GatewayCronJob['schedule']) ?? { kind: 'cron', expr: '* * * * *' },
      payload: (p.payload as GatewayCronJob['payload']) ?? {},
      state: { runCount: 0, failCount: 0 },
      createdAtMs: Date.now(),
      updatedAtMs: Date.now(),
    };
  },

  'cron.update': async (params): Promise<GatewayCronJob> => {
    const p = params as Record<string, unknown>;
    const existing = mockCronJobs.find((j) => j.id === p.id);
    if (!existing) throw new Error('Cron job not found');
    return toCronJob(existing);
  },

  'cron.remove': async (): Promise<{ ok: boolean }> => {
    return { ok: true };
  },

  'cron.run': async (): Promise<{ ok: boolean }> => {
    return { ok: true };
  },

  'health': async (): Promise<GatewayHealthResponse> => {
    return {
      ok: true,
      status: 'live',
      version: mockGateway.version,
      uptime: mockGateway.uptime,
      resources: mockGateway.resources,
    };
  },

  'channels.status': async (): Promise<GatewayChannelStatus[]> => {
    return mockChannels.map(toChannelStatus);
  },

  'usage.status': async (): Promise<GatewayUsageStatus> => {
    const totalTokens = mockAgents.reduce((sum, a) => sum + a.tokenUsage.total, 0);
    const totalCost = mockAgents.reduce((sum, a) => sum + a.costTotal, 0);
    return {
      totalTokens,
      totalCost,
      todayTokens: Math.floor(totalTokens * 0.1),
      todayCost: mockDashboardStats.todayCost,
    };
  },

  'logs.tail': async (params): Promise<GatewayLogEntry[]> => {
    const p = (params ?? {}) as { count?: number };
    const count = p.count ?? 50;
    return generateMockLogs(count).map(toLogEntry);
  },
};

export async function mockHandler(method: string, params?: unknown): Promise<unknown> {
  const handler = handlers[method];
  if (!handler) {
    throw new Error(`Mock handler not found: ${method}`);
  }
  // Simulate network latency
  await new Promise((r) => setTimeout(r, 50 + Math.random() * 100));
  return handler(params);
}
