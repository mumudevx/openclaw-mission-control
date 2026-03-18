import { create } from 'zustand';
import type { Task, TaskStatus } from '@/types';

interface TaskFilter {
  priority?: string;
  assigneeId?: string;
  search?: string;
}

interface TaskState {
  tasks: Task[];
  filter: TaskFilter;

  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
  moveTask: (id: string, newStatus: TaskStatus) => void;
  setFilter: (filter: TaskFilter) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  filter: {},

  setTasks: (tasks) => set({ tasks }),
  addTask: (task) =>
    set((state) => ({ tasks: [...state.tasks, task] })),

  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      ),
    })),

  removeTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    })),

  moveTask: (id, newStatus) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, status: newStatus } : task
      ),
    })),

  setFilter: (filter) =>
    set({ filter }),
}));
