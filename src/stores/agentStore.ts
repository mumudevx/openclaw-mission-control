import { create } from 'zustand';
import type { Agent } from '@/types';

type ViewMode = 'grid' | 'list';

interface AgentFilter {
  status?: string;
  model?: string;
}

interface AgentState {
  agents: Agent[];
  selectedAgentId: string | null;
  filter: AgentFilter;
  viewMode: ViewMode;

  setAgents: (agents: Agent[]) => void;
  addAgent: (agent: Agent) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  removeAgent: (id: string) => void;
  selectAgent: (id: string | null) => void;
  setFilter: (filter: AgentFilter) => void;
  setViewMode: (mode: ViewMode) => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  agents: [],
  selectedAgentId: null,
  filter: {},
  viewMode: 'grid',

  setAgents: (agents) =>
    set({ agents }),

  addAgent: (agent) =>
    set((state) => ({ agents: [...state.agents, agent] })),

  updateAgent: (id, updates) =>
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.id === id ? { ...agent, ...updates } : agent
      ),
    })),

  removeAgent: (id) =>
    set((state) => ({
      agents: state.agents.filter((agent) => agent.id !== id),
      selectedAgentId: state.selectedAgentId === id ? null : state.selectedAgentId,
    })),

  selectAgent: (id) =>
    set({ selectedAgentId: id }),

  setFilter: (filter) =>
    set({ filter }),

  setViewMode: (mode) =>
    set({ viewMode: mode }),
}));
