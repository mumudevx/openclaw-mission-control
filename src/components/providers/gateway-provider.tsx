"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { gateway } from "@/lib/gateway";
import type { ConnectionState, ServerInfo } from "@/lib/gateway";
import { useConnectionStore } from "@/stores/connectionStore";

interface GatewayContextValue {
  connectionState: ConnectionState;
  serverInfo: ServerInfo | null;
  reconnect: () => void;
}

const GatewayContext = createContext<GatewayContextValue>({
  connectionState: "disconnected",
  serverInfo: null,
  reconnect: () => {},
});

export function useGateway(): GatewayContextValue {
  return useContext(GatewayContext);
}

export function GatewayProvider({ children }: { children: ReactNode }) {
  const gatewayUrl = useConnectionStore((s) => s.gatewayUrl);
  const gatewayToken = useConnectionStore((s) => s.gatewayToken);
  const setupCompleted = useConnectionStore((s) => s.setupCompleted);

  const [connectionState, setConnectionState] = useState<ConnectionState>("disconnected");
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);

  const doConnect = useCallback(() => {
    gateway.configure({ url: gatewayUrl, token: gatewayToken });
    gateway.connect();
  }, [gatewayUrl, gatewayToken]);

  useEffect(() => {
    const unsub = gateway.onStateChange((state) => {
      setConnectionState(state);
      if (state === "connected") {
        setServerInfo(gateway.serverInfo);
      }
    });

    if (setupCompleted) {
      doConnect();
    }

    return () => {
      unsub();
      gateway.disconnect();
    };
  }, [doConnect, setupCompleted]);

  const reconnect = useCallback(() => {
    gateway.disconnect();
    doConnect();
  }, [doConnect]);

  return (
    <GatewayContext.Provider value={{ connectionState, serverInfo, reconnect }}>
      {children}
    </GatewayContext.Provider>
  );
}
