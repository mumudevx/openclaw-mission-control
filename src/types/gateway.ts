export type GatewayStatus = 'connected' | 'disconnected' | 'connecting';

export type ChannelType =
  | 'telegram'
  | 'whatsapp'
  | 'slack'
  | 'discord'
  | 'web'
  | 'api';

export type ChannelStatus = 'active' | 'inactive';

export interface GatewayStats {
  agentCount: number;
  sessionCount: number;
  channelCount: number;
  heartbeatSeconds: number;
}

export interface Gateway {
  id: string;
  url: string;
  status: GatewayStatus;
  uptime: number;
  connectedAt?: string;
  version: string;
  stats: GatewayStats;
}

export interface Channel {
  id: string;
  name: string;
  type: ChannelType;
  status: ChannelStatus;
  connectedAt: string;
  messageCount: number;
}

export interface WebSocketConnection {
  id: string;
  clientId: string;
  connectedAt: string;
  lastMessage: string;
  messageCount: number;
}

export interface GatewayEvent {
  id: string;
  type: string;
  source: string;
  message: string;
  timestamp: string;
  data?: Record<string, unknown>;
}
