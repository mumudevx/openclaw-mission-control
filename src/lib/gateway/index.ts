import { GatewayClient } from './client';

export const gateway = new GatewayClient();

// Expose for browser console debugging
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).gateway = gateway;
}

export { GatewayClient } from './client';
export {
  adaptAgent,
  adaptSession,
  adaptCronJob,
  adaptChannelsFromStatus,
  adaptHealth,
  adaptLogEntry,
  toBackendCronCreate,
  toBackendAgentCreate,
  toBackendAgentUpdate,
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
  AgentFilesListResponse,
  AgentFileGetResponse,
  AgentFileSetResponse,
  AgentCreateResponse,
  SkillStatusEntry,
  SkillsStatusResponse,
  SkillsInstallResponse,
  SkillsUpdateResponse,
  Snapshot,
  ServerInfo,
} from './types';
