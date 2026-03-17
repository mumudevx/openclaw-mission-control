import { create } from 'zustand';
import type { CronJob, CronRun } from '@/types';

interface CronState {
  jobs: CronJob[];
  runs: CronRun[];
  selectedJobId: string | null;

  setJobs: (jobs: CronJob[]) => void;
  addJob: (job: CronJob) => void;
  updateJob: (id: string, updates: Partial<CronJob>) => void;
  removeJob: (id: string) => void;
  addRun: (run: CronRun) => void;
  selectJob: (id: string | null) => void;
}

export const useCronStore = create<CronState>((set) => ({
  jobs: [],
  runs: [],
  selectedJobId: null,

  setJobs: (jobs) => set({ jobs }),

  addJob: (job) =>
    set((state) => ({ jobs: [...state.jobs, job] })),

  updateJob: (id, updates) =>
    set((state) => ({
      jobs: state.jobs.map((job) =>
        job.id === id ? { ...job, ...updates } : job
      ),
    })),

  removeJob: (id) =>
    set((state) => ({
      jobs: state.jobs.filter((job) => job.id !== id),
      selectedJobId: state.selectedJobId === id ? null : state.selectedJobId,
    })),

  addRun: (run) =>
    set((state) => ({ runs: [...state.runs, run] })),

  selectJob: (id) =>
    set({ selectedJobId: id }),
}));
