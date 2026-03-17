import { create } from 'zustand';
import type { Gateway, Channel, GatewayEvent } from '@/types';

interface GatewayState {
  gateway: Gateway | null;
  channels: Channel[];
  events: GatewayEvent[];

  setGateway: (gateway: Gateway | null) => void;
  addEvent: (event: GatewayEvent) => void;
  setChannels: (channels: Channel[]) => void;
  updateChannel: (id: string, updates: Partial<Channel>) => void;
}

export const useGatewayStore = create<GatewayState>((set) => ({
  gateway: null,
  channels: [],
  events: [],

  setGateway: (gateway) =>
    set({ gateway }),

  addEvent: (event) =>
    set((state) => ({ events: [...state.events, event] })),

  setChannels: (channels) =>
    set({ channels }),

  updateChannel: (id, updates) =>
    set((state) => ({
      channels: state.channels.map((channel) =>
        channel.id === id ? { ...channel, ...updates } : channel
      ),
    })),
}));
