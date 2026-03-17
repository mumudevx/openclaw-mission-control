export type CronStatus = 'active' | 'paused' | 'running' | 'failed';

export type CronRunStatus = 'success' | 'failed' | 'running';

export type ScheduleType = 'cron' | 'interval' | 'once';

export type SessionTarget = 'isolated' | 'main';

export type DeliveryMode = 'announce' | 'webhook' | 'none';

export type DeliveryChannel = 'whatsapp' | 'discord' | 'slack' | 'telegram' | 'imessage' | 'last';

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
  scheduleType?: ScheduleType;
  intervalMs?: number;
  runAt?: string;
  sessionType?: SessionTarget;
  prompt?: string;
  model?: string;
  deliveryMode?: DeliveryMode;
  deliveryChannel?: DeliveryChannel;
  webhookUrl?: string;
  timeout?: number;
  maxRetries?: number;
  timezone?: string;
  deleteAfterRun?: boolean;
  lightContext?: boolean;
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
