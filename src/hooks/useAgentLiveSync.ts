import { useQueryClient } from '@tanstack/react-query';
import { useGatewayEvent } from './useGatewayEvent';
import { gateway } from '@/lib/gateway';
import type { AgentsListResponse } from '@/lib/gateway';

/**
 * Subscribes to gateway agent/presence events and applies delta updates
 * to the TanStack Query cache instead of triggering full refetches.
 */
export function useAgentLiveSync() {
  const queryClient = useQueryClient();

  useGatewayEvent('presence', (payload) => {
    const p = payload as { agentId?: string; online?: boolean; activeSessions?: number } | undefined;

    if (p?.agentId && gateway.snapshot.presence) {
      gateway.snapshot.presence[p.agentId] = {
        ...gateway.snapshot.presence[p.agentId],
        online: p.online ?? false,
        activeSessions: p.activeSessions,
        lastSeen: Date.now(),
      };
    }

    // Mark stale — TanStack Query will background-refetch if observed
    queryClient.invalidateQueries({ queryKey: ['gateway', 'agents.list'] });
  });

  useGatewayEvent('agent', (payload) => {
    const p = payload as { action?: string; agent?: Record<string, unknown>; agentId?: string } | undefined;

    if (p?.action === 'deleted' && p.agentId) {
      queryClient.setQueryData<AgentsListResponse>(
        ['gateway', 'agents.list', undefined],
        (old) => old ? { ...old, agents: old.agents.filter((a) => a.id !== p.agentId) } : old,
      );
      return;
    }

    // For create/update or unknown actions, invalidate to refetch
    queryClient.invalidateQueries({ queryKey: ['gateway', 'agents.list'] });
  });
}
