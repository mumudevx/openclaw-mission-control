import { create } from 'zustand';
import type { LogEntry, LogLevel, LogSource } from '@/types';

interface LogFilter {
  level?: LogLevel[];
  source?: LogSource[];
  search?: string;
}

interface LogState {
  logs: LogEntry[];
  maxLogs: number;
  filter: LogFilter;
  autoScroll: boolean;

  addLog: (entry: LogEntry) => void;
  clearLogs: () => void;
  setLogs: (logs: LogEntry[]) => void;
  setFilter: (filter: LogFilter) => void;
  toggleAutoScroll: () => void;
}

export const useLogStore = create<LogState>((set) => ({
  logs: [],
  maxLogs: 1000,
  filter: {},
  autoScroll: true,

  addLog: (entry) =>
    set((state) => ({
      logs: [...state.logs, entry].slice(-state.maxLogs),
    })),

  clearLogs: () =>
    set({ logs: [] }),

  setLogs: (logs) =>
    set((state) => ({ logs: logs.slice(-state.maxLogs) })),

  setFilter: (filter) =>
    set({ filter }),

  toggleAutoScroll: () =>
    set((state) => ({ autoScroll: !state.autoScroll })),
}));
