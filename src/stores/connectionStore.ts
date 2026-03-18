import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ConnectionState {
  gatewayUrl: string;
  gatewayToken: string;
  setupCompleted: boolean;

  setGatewayUrl: (url: string) => void;
  setGatewayToken: (token: string) => void;
  setSetupCompleted: (v: boolean) => void;
  resetSetup: () => void;
}

const DEFAULT_URL = 'ws://localhost:18789';
const DEFAULT_TOKEN = '';

export const useConnectionStore = create<ConnectionState>()(
  persist(
    (set) => ({
      gatewayUrl: DEFAULT_URL,
      gatewayToken: DEFAULT_TOKEN,
      setupCompleted: false,

      setGatewayUrl: (url) => set({ gatewayUrl: url }),
      setGatewayToken: (token) => set({ gatewayToken: token }),
      setSetupCompleted: (v) => set({ setupCompleted: v }),
      resetSetup: () => set({ gatewayUrl: DEFAULT_URL, gatewayToken: DEFAULT_TOKEN, setupCompleted: false }),
    }),
    {
      name: 'openclaw-connection',
    },
  ),
);
