import { useAgentsList } from './useAgents';
import { useSessionsList } from './useSessions';
import { useCronList } from './useCronJobs';

export function useAgent(agentId: string) {
  const { agents, isLoading, refetch } = useAgentsList();
  const agent = agents.find((a) => a.id === agentId) ?? null;
  return { agent, isLoading, refetch };
}

export function useAgentSessions(agentId: string) {
  const { sessions, isLoading } = useSessionsList();
  const agentSessions = sessions
    .filter((s) => s.agentId === agentId)
    .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
  return { sessions: agentSessions, isLoading };
}

export function useAgentCronJobs(agentId: string) {
  const { jobs, isLoading } = useCronList();
  const agentJobs = jobs.filter((j) => j.agentId === agentId);
  return { jobs: agentJobs, isLoading };
}
