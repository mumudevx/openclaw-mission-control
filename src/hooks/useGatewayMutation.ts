import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { gateway } from '@/lib/gateway';

export function useGatewayMutation<P = unknown, R = unknown>(
  method: string,
  opts?: Omit<UseMutationOptions<R, Error, P>, 'mutationFn'>,
) {
  return useMutation<R, Error, P>({
    mutationFn: (params: P) => gateway.rpc<P, R>(method, params),
    ...opts,
  });
}
