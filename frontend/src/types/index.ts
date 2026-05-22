export interface Task {
  id: number;
  taskName: string;
  projectName: string | null;
  location: string | null;
  department: string | null;
  description: string | null;
  assignedTo: string | null;
  startDate: string;
  endDate: string;
  priority: string;
  status: string;
  dependencyIds: string | null;
  estimatedHours: number | null;
  actualHours: number | null;
  notes: string | null;
  completionPct: number;
  milestone: boolean;
  comments: TaskComment[];
  attachments: TaskAttachment[];
  activities: TaskActivity[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskComment {
  id: number;
  taskId: number;
  author: string;
  content: string;
  createdAt: string;
}

export interface TaskAttachment {
  id: number;
  taskId: number;
  filename: string;
  filesize: number | null;
  mimetype: string | null;
  createdAt: string;
}

export interface TaskActivity {
  id: number;
  taskId: number;
  action: string;
  details: string | null;
  createdBy: string;
  createdAt: string;
}

export interface TaskStats {
  total: number;
  byStatus: Record<string, number>;
  byLocation: Record<string, number>;
  upcoming: number;
  delayed: number;
}
