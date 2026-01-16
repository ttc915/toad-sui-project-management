export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Comment {
  id: string;
  text: string;
  author: User;
  createdAt: string;
}

export type Priority = 'low' | 'medium' | 'high';
export type Status = 'backlog' | 'planned' | 'in-progress' | 'blocked' | 'done' | 'not-started' | 'needs-review';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  dueDate?: string;
  assignees: User[];
  tags: string[];
  columnId: string;
  boardId?: string;
  subtasks: Subtask[];
  comments: Comment[];
  suiObjectId?: string;
  suiTxHash?: string;
  suiOwner?: string;
  effort?: string;
  objective?: string;
}

export interface Column {
  id: string;
  title: string;
  color: string;
  statusLabel: string;
  tasks: Task[];
}

export interface Board {
  id: string;
  name: string;
  description: string;
  columns: Column[];
}

export interface AnalyticsData {
  tasksByStatus: {
    status: string;
    count: number;
  }[];
  completionRate: number;
  onChainTasksThisWeek: number;
  velocity: {
    week: string;
    completed: number;
  }[];
}
