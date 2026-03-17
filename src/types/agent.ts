export type AgentStatus = 'active' | 'idle' | 'error' | 'offline';

export interface TokenUsage {
  prompt: number;
  completion: number;
  total: number;
}

export interface Agent {
  id: string;
  name: string;
  model: string;
  status: AgentStatus;
  description: string;
  avatar: string;
  tokenUsage: TokenUsage;
  costTotal: number;
  activeSessions: number;
  lastActive: string;
  tasks: string[];
  createdAt: string;
  updatedAt: string;
}

export type AgentSessionStatus = 'active' | 'idle' | 'completed' | 'error';

export interface AgentSession {
  id: string;
  agentId: string;
  status: AgentSessionStatus;
  startedAt: string;
  endedAt?: string;
  tokensUsed: number;
  cost: number;
}

export type ChatMessageRole = 'user' | 'assistant' | 'system';
export interface ChatMessage {
  id: string;
  agentId: string;
  role: ChatMessageRole;
  content: string;
  timestamp: string;
}

export type ActivityType = 'tool_call' | 'file_operation' | 'reasoning' | 'status_change' | 'task_update' | 'error';
export interface AgentActivity {
  id: string;
  agentId: string;
  type: ActivityType;
  description: string;
  timestamp: string;
  metadata?: Record<string, string>;
}
