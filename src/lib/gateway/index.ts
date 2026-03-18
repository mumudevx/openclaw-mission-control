import { GatewayClient } from './client';

export const gateway = new GatewayClient();

export { GatewayClient } from './client';
export {
  adaptAgent,
  adaptSession,
  adaptCronJob,
  adaptChannel,
  adaptHealth,
  adaptLogEntry,
  toBackendCronCreate,
  toBackendAgentCreate,
} from './adapters';
export type {
  ConnectionState,
  GatewayAgentRow,
  GatewayCronJob,
  GatewaySessionRow,
  GatewayChannelStatus,
  GatewayHealthResponse,
  GatewayUsageStatus,
  GatewayLogEntry,
  AgentsListResponse,
  SessionsListResponse,
  CronListResponse,
  LogsTailResponse,
  ChannelsStatusResponse,
  Snapshot,
  ServerInfo,
} from './types';
