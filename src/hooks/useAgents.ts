import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useGatewayQuery } from './useGatewayQuery';
import { useGatewayMutation } from './useGatewayMutation';
import { adaptAgent } from '@/lib/gateway/adapters';
import { gateway } from '@/lib/gateway';
import type {
  AgentsListResponse,
  SessionsListResponse,
  AgentCreateResponse,
  AgentFilesListResponse,
  AgentFileGetResponse,
  AgentFileSetResponse,
  SkillsStatusResponse,
} from '@/lib/gateway';
import type { Agent } from '@/types';
import { useAgentStore } from '@/stores/agentStore';

export function useAgentsList() {
  const { setAgents } = useAgentStore();

  const agentsQuery = useGatewayQuery<undefined, AgentsListResponse>('agents.list');
  const sessionsQuery = useGatewayQuery<undefined, SessionsListResponse>('sessions.list');

  const agentRows = agentsQuery.data?.agents ?? [];
  const defaultId = agentsQuery.data?.defaultId;
  const sessionRows = sessionsQuery.data?.sessions ?? [];

  const agents = agentRows.map((row) =>
    adaptAgent(row, defaultId, sessionRows, gateway.snapshot.presence?.[row.id]),
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

  return useGatewayMutation<
    { name: string; workspace: string; emoji?: string; avatar?: string },
    AgentCreateResponse
  >('agents.create', {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gateway', 'agents.list'] });
    },
  });
}

export function useUpdateAgent() {
  const queryClient = useQueryClient();

  return useGatewayMutation<
    { agentId: string; name?: string; workspace?: string; model?: string; avatar?: string },
    { ok: boolean }
  >('agents.update', {
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

// --- Workspace file hooks ---

export function useAgentFilesList(agentId: string | undefined) {
  return useGatewayQuery<{ agentId: string }, AgentFilesListResponse>(
    'agents.files.list',
    agentId ? { agentId } : undefined,
    { enabled: !!agentId },
  );
}

export function useAgentFileGet(agentId: string | undefined, fileName: string | undefined) {
  return useGatewayQuery<{ agentId: string; name: string }, AgentFileGetResponse>(
    'agents.files.get',
    agentId && fileName ? { agentId, name: fileName } : undefined,
    { enabled: !!agentId && !!fileName },
  );
}

export function useAgentFileSave() {
  const queryClient = useQueryClient();

  return useGatewayMutation<
    { agentId: string; name: string; content: string },
    AgentFileSetResponse
  >('agents.files.set', {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gateway', 'agents.files.list'] });
      queryClient.invalidateQueries({ queryKey: ['gateway', 'agents.files.get'] });
    },
  });
}

// --- Skills hook ---

export function useAgentSkills(agentId: string | undefined) {
  return useGatewayQuery<{ agentId: string }, SkillsStatusResponse>(
    'skills.status',
    agentId ? { agentId } : undefined,
    { enabled: !!agentId },
  );
}

export type { Agent };
