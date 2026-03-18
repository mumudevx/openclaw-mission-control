import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useGatewayQuery } from './useGatewayQuery';
import { useGatewayMutation } from './useGatewayMutation';
import { adaptAgent, toBackendAgentCreate } from '@/lib/gateway/adapters';
import { gateway } from '@/lib/gateway';
import type { GatewayAgentRow, AgentsListResponse, SessionsListResponse } from '@/lib/gateway';
import type { Agent } from '@/types';
import { useAgentStore } from '@/stores/agentStore';

export function useAgentsList() {
  const { setAgents } = useAgentStore();

  const agentsQuery = useGatewayQuery<undefined, AgentsListResponse>('agents.list');
  const sessionsQuery = useGatewayQuery<undefined, SessionsListResponse>('sessions.list');

  const agentRows = agentsQuery.data?.agents ?? [];
  const sessionRows = sessionsQuery.data?.sessions ?? [];

  const agents = agentRows.map((row) =>
    adaptAgent(row, sessionRows, gateway.snapshot.presence?.[row.id]),
  );

  useEffect(() => {
    if (agents.length > 0) {
      setAgents(agents);
    }
  }, [agents.length, setAgents]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    agents,
    isLoading: agentsQuery.isLoading || sessionsQuery.isLoading,
    error: agentsQuery.error || sessionsQuery.error,
    refetch: () => {
      agentsQuery.refetch();
      sessionsQuery.refetch();
    },
  };
}

export function useCreateAgent() {
  const queryClient = useQueryClient();

  return useGatewayMutation<Record<string, unknown>, GatewayAgentRow>('agents.create', {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gateway', 'agents.list'] });
    },
  });
}

export function useUpdateAgent() {
  const queryClient = useQueryClient();

  return useGatewayMutation<Record<string, unknown>, GatewayAgentRow>('agents.update', {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gateway', 'agents.list'] });
    },
  });
}

export function useDeleteAgent() {
  const queryClient = useQueryClient();

  return useGatewayMutation<{ id: string }, { ok: boolean }>('agents.delete', {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gateway', 'agents.list'] });
    },
  });
}

export { toBackendAgentCreate };
export type { Agent };
