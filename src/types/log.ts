export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export type LogSource =
  | 'agent'
  | 'gateway'
  | 'cron'
  | 'system'
  | 'task'
  | 'user';

export interface LogEntry {
  id: string;
  level: LogLevel;
  source: LogSource;
  message: string;
  timestamp: string;
  agentId?: string;
  metadata?: Record<string, unknown>;
  stackTrace?: string;
}
