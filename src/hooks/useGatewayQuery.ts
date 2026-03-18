import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { gateway } from '@/lib/gateway';
import { useGateway } from '@/components/providers/gateway-provider';

export function useGatewayQuery<P = unknown, R = unknown>(
  method: string,
  params?: P,
  opts?: Partial<UseQueryOptions<R, Error>>,
) {
  const { connectionState } = useGateway();

  return useQuery<R, Error>({
    queryKey: ['gateway', method, params],
    queryFn: () => gateway.rpc<P, R>(method, params as P),
    enabled: connectionState === 'connected',
    ...opts,
  });
}
