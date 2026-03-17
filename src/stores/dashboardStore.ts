import { create } from 'zustand';

interface DashboardStats {
  activeAgents: number;
  activeTasks: number;
  gatewayStatus: number;
  todayCost: number;
  cronJobs: number;
}

interface DashboardState {
  stats: DashboardStats;

  setStats: (stats: DashboardStats) => void;
  refreshStats: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: {
    activeAgents: 0,
    activeTasks: 0,
    gatewayStatus: 0,
    todayCost: 0,
    cronJobs: 0,
  },

  setStats: (stats) =>
    set({ stats }),

  refreshStats: () =>
    set((state) => ({ stats: { ...state.stats } })),
}));
