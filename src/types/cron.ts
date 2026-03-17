export type CronStatus = 'active' | 'paused' | 'running' | 'failed';

export type CronRunStatus = 'success' | 'failed' | 'running';

export interface CronJob {
  id: string;
  name: string;
  description: string;
  expression: string;
  status: CronStatus;
  lastRun?: string;
  nextRun: string;
  runCount: number;
  failCount: number;
  createdAt: string;
  agentId?: string;
}

export interface CronRun {
  id: string;
  jobId: string;
  status: CronRunStatus;
  startedAt: string;
  endedAt?: string;
  output?: string;
  error?: string;
}
