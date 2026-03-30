import { useEffect, useRef } from 'react';
import { gateway } from '@/lib/gateway';

export function useGatewayEvent(
  event: string,
  handler: (payload: unknown) => void,
) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    return gateway.on(event, (payload) => handlerRef.current(payload));
  }, [event]);
}
