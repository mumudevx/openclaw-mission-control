import { useGatewayQuery } from './useGatewayQuery';
import { adaptSession } from '@/lib/gateway/adapters';
import type { GatewaySessionRow } from '@/lib/gateway';

export function useSessionsList() {
  const query = useGatewayQuery<undefined, GatewaySessionRow[]>('sessions.list');

  const sessions = query.data ? query.data.map(adaptSession) : [];

  return {
    sessions,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
