import { useEffect, useMemo, useCallback } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
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
  const setAgents = useAgentStore((s) => s.setAgents);

  const agentsQuery = useGatewayQuery<undefined, AgentsListResponse>('agents.list');
  const sessionsQuery = useGatewayQuery<undefined, SessionsListResponse>('sessions.list');

  const agentRows = agentsQuery.data?.agents ?? [];
  const defaultId = agentsQuery.data?.defaultId;
  const sessionRows = sessionsQuery.data?.sessions ?? [];

  const agents = useMemo(
    () => agentRows.map((row) =>
      adaptAgent(row, defaultId, sessionRows, gateway.snapshot.presence?.[row.id]),
    ),
    [agentRows, defaultId, sessionRows],
  );

  useEffect(() => {
    if (agents.length > 0) {
      setAgents(agents);
    }
  }, [agents, setAgents]);

  const refetch = useCallback(() => {
    agentsQuery.refetch();
    sessionsQuery.refetch();
  }, [agentsQuery, sessionsQuery]);

  return {
    agents,
    isLoading: agentsQuery.isLoading || sessionsQuery.isLoading,
    error: agentsQuery.error || sessionsQuery.error,
    refetch,
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

interface ConfigResponse {
  raw: string;
  hash: string;
}

export function useDeleteAgent() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { agentId: string }>({
    mutationFn: async ({ agentId }) => {
      // 1. Get current config
      const config = await gateway.rpc<undefined, ConfigResponse>('config.get');
      const parsed = JSON.parse(config.raw);

      // 2. Remove agent from agents.list
      const agentsList: Array<{ id: string }> = parsed.agents?.list ?? [];
      const newList = agentsList.filter((a) => a.id !== agentId);

      if (newList.length === agentsList.length) {
        throw new Error(`Agent "${agentId}" not found in config`);
      }

      const updated = { ...parsed, agents: { ...parsed.agents, list: newList } };

      // 3. Apply config
      await gateway.rpc('config.apply', {
        raw: JSON.stringify(updated),
        baseHash: config.hash,
      });

      // 4. Clean up sessions (best effort)
      try {
        await gateway.rpc('sessions.delete', {
          key: `agent:${agentId}:main`,
          deleteTranscript: true,
        });
      } catch {
        // Session may not exist — ignore
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gateway', 'agents.list'] });
      queryClient.invalidateQueries({ queryKey: ['gateway', 'sessions.list'] });
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
    { enabled: !!agentId, staleTime: 5 * 60 * 1000 },
  );
}

export type { Agent };
