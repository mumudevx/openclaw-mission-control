export const WS_EVENTS = {
  AGENT_STATUS_CHANGE: 'agent:status_change',
  AGENT_ACTIVITY: 'agent:activity',
  TASK_UPDATE: 'task:update',
  LOG_ENTRY: 'log:entry',
  CRON_RUN: 'cron:run',
  GATEWAY_STATUS: 'gateway:status',
  GATEWAY_EVENT: 'gateway:event',
  CHANNEL_UPDATE: 'channel:update',
} as const;

export type WsEvent = (typeof WS_EVENTS)[keyof typeof WS_EVENTS];
