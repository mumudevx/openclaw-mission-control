import { useGatewayQuery } from './useGatewayQuery';
import { adaptSession } from '@/lib/gateway/adapters';
import type { SessionsListResponse } from '@/lib/gateway';

export function useSessionsList() {
  const query = useGatewayQuery<undefined, SessionsListResponse>('sessions.list');

  const sessions = (query.data?.sessions ?? []).map(adaptSession);

  return {
    sessions,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
