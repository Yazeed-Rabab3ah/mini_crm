export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "assigned" | "submitted" | "reviewed" | "approved" | "rejected";
export type Task = {
  id: number;
  contact: number;
  title: string;
  is_done: boolean;
  priority: TaskPriority;
  due_date?: string | null;
  status: TaskStatus;
  content: string;
  created_at: string;
  created_by?: number | null;
  assigned_to_user?: number | null;
  assigned_to_team?: number | null;
};

export type TaskStatusHistory = {
  id: number;
  task: number;
  name: TaskStatus;
  note?: string;
  rejection_reason?: string;
  changed_by?: number;
  created_at: string;
};

export type TaskListParams = {
  contact?: number | string;
  // Query params coming from the UI/back-end can arrive as boolean or 0/1 strings.
  // Keep a permissive type to avoid TS friction while still being correct at runtime.
  is_done?: boolean | 0 | 1 | "";
  priority?: TaskPriority | "";
  status?: TaskStatus | "";
  due_from?: string;
  due_to?: string;
  page?: number;
};

export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};