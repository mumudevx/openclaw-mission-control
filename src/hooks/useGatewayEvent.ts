import { useEffect } from 'react';
import { gateway } from '@/lib/gateway';

export function useGatewayEvent(
  event: string,
  handler: (payload: unknown) => void,
) {
  useEffect(() => {
    return gateway.on(event, handler);
  }, [event, handler]);
}
