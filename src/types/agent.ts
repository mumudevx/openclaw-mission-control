export type AgentStatus = 'active' | 'idle' | 'offline';

export interface Agent {
  id: string;
  name: string;
  isDefault: boolean;
  identity?: {
    name?: string;
    theme?: string;
    emoji?: string;
    avatar?: string;
    avatarUrl?: string;
  };
  // Derived from sessions
  sessionCount: number;
  totalTokens: number;
  estimatedCost: number;
  lastActive?: string;
  // Derived from presence
  status: AgentStatus;
}

export type AgentSessionStatus = 'running' | 'done' | 'failed' | 'killed' | 'timeout';

export interface AgentSession {
  key: string;
  agentId?: string;
  kind: 'direct' | 'group' | 'global' | 'unknown';
  displayName?: string;
  channel?: string;
  model?: string;
  status?: AgentSessionStatus;
  updatedAt: number | null;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  estimatedCostUsd?: number;
  startedAt?: number;
  endedAt?: number;
  runtimeMs?: number;
}

// Workspace file types (agents.files.* RPCs)
export interface AgentWorkspaceFile {
  name: string;
  path: string;
  size: number;
  updatedAtMs: number;
  missing: boolean;
}

export interface AgentFileContent {
  name: string;
  content: string;
  size: number;
  updatedAtMs: number;
  missing?: boolean;
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
