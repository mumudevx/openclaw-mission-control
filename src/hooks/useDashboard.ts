import { useGatewayQuery } from './useGatewayQuery';
import { adaptAgent, adaptCronJob } from '@/lib/gateway/adapters';
import { gateway } from '@/lib/gateway';
import type {
  GatewayAgentRow,
  GatewaySessionRow,
  GatewayCronJob,
  GatewayHealthResponse,
  GatewayUsageStatus,
} from '@/lib/gateway';
import { useGateway } from '@/components/providers/gateway-provider';
import type { DashboardStats } from '@/types';

export function useDashboardStats() {
  const { connectionState } = useGateway();

  const agentsQuery = useGatewayQuery<undefined, GatewayAgentRow[]>('agents.list');
  const sessionsQuery = useGatewayQuery<undefined, GatewaySessionRow[]>('sessions.list');
  const cronQuery = useGatewayQuery<undefined, GatewayCronJob[]>('cron.list');
  const healthQuery = useGatewayQuery<undefined, GatewayHealthResponse>('health');
  const usageQuery = useGatewayQuery<undefined, GatewayUsageStatus>('usage.status');

  const isLoading =
    agentsQuery.isLoading ||
    sessionsQuery.isLoading ||
    cronQuery.isLoading ||
    healthQuery.isLoading ||
    usageQuery.isLoading;

  const agents =
    agentsQuery.data && sessionsQuery.data
      ? agentsQuery.data.map((row) =>
          adaptAgent(row, sessionsQuery.data!, gateway.snapshot.presence?.[row.id]),
        )
      : [];

  const cronJobs = cronQuery.data ? cronQuery.data.map(adaptCronJob) : [];

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
