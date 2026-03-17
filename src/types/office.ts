export type AgentSpriteState =
  | 'active'
  | 'idle'
  | 'processing'
  | 'error'
  | 'offline';

export interface AgentSprite {
  id: string;
  agentId: string;
  name: string;
  x: number;
  y: number;
  state: AgentSpriteState;
  currentAction?: string;
  deskId?: string;
}

export interface Desk {
  id: string;
  x: number;
  y: number;
  occupied: boolean;
  agentId?: string;
}

export interface Decoration {
  id: string;
  type: string;
  x: number;
  y: number;
}

export interface OfficeLayout {
  desks: Desk[];
  decorations: Decoration[];
}
