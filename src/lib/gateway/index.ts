import { GatewayClient } from './client';

export const gateway = new GatewayClient();

export { GatewayClient } from './client';
export { mockHandler } from './mock-handler';
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
  Snapshot,
  ServerInfo,
} from './types';
