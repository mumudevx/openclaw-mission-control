export type TaskStatus =
  | 'backlog'
  | 'inbox'
  | 'assigned'
  | 'in_progress'
  | 'testing'
  | 'review'
  | 'done';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  labels: string[];
  subtasks: Subtask[];
}
