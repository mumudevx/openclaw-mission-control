import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ConnectionState {
  gatewayUrl: string;
  gatewayToken: string;
  mockMode: boolean;

  setGatewayUrl: (url: string) => void;
  setGatewayToken: (token: string) => void;
  setMockMode: (mock: boolean) => void;
}

const getEnvDefault = (key: string, fallback: string): string => {
  if (typeof window !== 'undefined') {
    return (process.env[key] as string) ?? fallback;
  }
  return fallback;
};

export const useConnectionStore = create<ConnectionState>()(
  persist(
    (set) => ({
      gatewayUrl: getEnvDefault('NEXT_PUBLIC_GATEWAY_URL', 'ws://localhost:18789'),
      gatewayToken: getEnvDefault('NEXT_PUBLIC_GATEWAY_TOKEN', ''),
      mockMode: getEnvDefault('NEXT_PUBLIC_MOCK_MODE', 'true') === 'true',

      setGatewayUrl: (url) => set({ gatewayUrl: url }),
      setGatewayToken: (token) => set({ gatewayToken: token }),
      setMockMode: (mock) => set({ mockMode: mock }),
    }),
    {
      name: 'openclaw-connection',
    },
  ),
);
