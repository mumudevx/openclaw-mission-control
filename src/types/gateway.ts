export type GatewayStatus = 'connected' | 'disconnected' | 'connecting';

export type ChannelType =
  | 'telegram'
  | 'whatsapp'
  | 'slack'
  | 'discord'
  | 'web'
  | 'api';

export type ChannelStatus = 'active' | 'inactive';

export interface SystemResources {
  cpu: number;
  memory: { used: number; total: number };
  disk: { used: number; total: number };
  network: { in: number; out: number };
}

export interface Gateway {
  id: string;
  url: string;
  status: GatewayStatus;
  uptime: number;
  connectedAt?: string;
  version: string;
  resources: SystemResources;
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
