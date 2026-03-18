import { useGatewayQuery } from './useGatewayQuery';
import { adaptAgent, adaptCronJob } from '@/lib/gateway/adapters';
import { gateway } from '@/lib/gateway';
import type {
  AgentsListResponse,
  SessionsListResponse,
  CronListResponse,
  GatewayHealthResponse,
  GatewayUsageStatus,
} from '@/lib/gateway';
import { useGateway } from '@/components/providers/gateway-provider';
import type { DashboardStats } from '@/types';

export function useDashboardStats() {
  const { connectionState } = useGateway();

  const agentsQuery = useGatewayQuery<undefined, AgentsListResponse>('agents.list');
  const sessionsQuery = useGatewayQuery<undefined, SessionsListResponse>('sessions.list');
  const cronQuery = useGatewayQuery<undefined, CronListResponse>('cron.list');
  const healthQuery = useGatewayQuery<undefined, GatewayHealthResponse>('health');
  const usageQuery = useGatewayQuery<undefined, GatewayUsageStatus>('usage.status');

  const isLoading =
    agentsQuery.isLoading ||
    sessionsQuery.isLoading ||
    cronQuery.isLoading ||
    healthQuery.isLoading ||
    usageQuery.isLoading;

  const agentRows = agentsQuery.data?.agents ?? [];
  const sessionRows = sessionsQuery.data?.sessions ?? [];

  const agents = agentRows.map((row) =>
    adaptAgent(row, sessionRows, gateway.snapshot.presence?.[row.id]),
  );

  const cronJobs = (cronQuery.data?.jobs ?? []).map(adaptCronJob);

  const stats: DashboardStats = {
    activeAgents: agents.filter((a) => a.status === 'active').length,
    activeTasks: 0, // Tasks are frontend-only
    gatewayStatus: connectionState === 'connected' ? 'connected' : 'disconnected',
    todayCost: usageQuery.data?.todayCost ?? 0,
    cronJobs: cronJobs.filter((j) => j.status === 'active' || j.status === 'running').length,
  };

  return {
    stats,
    agents,
    cronJobs,
    isLoading,
    error: agentsQuery.error || sessionsQuery.error || cronQuery.error,
  };
}
