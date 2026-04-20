import api from "./client";
import type { Task, TaskListParams, PaginatedResponse, TaskPriority, TaskStatus, TaskStatusHistory } from "../types/task";
  
export type TaskPayload = {
  title: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_date?: string | null;
  is_done?: boolean;
  content?: string;
  assigned_to_user?: number | null;
  assigned_to_team?: number | null;
};

export type TaskStatusPayload = {
  task: number;
  name: TaskStatus;
  note?: string;
  rejection_reason?: string;
  changed_by?: number;
  created_at: string;
};

export async function getTasks(params: TaskListParams) {
  const res = await api.get<PaginatedResponse<Task>>("/api/tasks/", { params });
  return res.data;
}
export async function getUserTasks(params: TaskListParams) {
  const res = await api.get<PaginatedResponse<Task>>("/api/tasks/my-tasks", { params });
  console.log("API response for getUserTasks:", res.data);
  return res.data;
}
export async function getTaskById(id: number | string) {
  const res = await api.get<Task>(`/api/tasks/${id}/details/`);
  return res.data;
}
export async function createTask(data: TaskPayload) {
  const res = await api.post<Task>("/api/tasks/", data);
  return res.data;
}

export async function updateTask(
  id: number | string,
  data: Partial<TaskPayload>
) {
  const res = await api.patch<Task>(`/api/tasks/${id}/update/`, data);
  return res.data;
}

export async function deleteTask(id: number | string) {
  await api.delete(`/api/tasks/${id}/`);
}

export async function getTaskStatusHistory(id: number | string) {
  const res = await api.get<TaskStatusHistory[]>(`/api/task-statuses/${id}/history/`);
  return res.data;
}

export async function createTaskStatusHistory(data: TaskStatusPayload) {
  const res = await api.post<TaskStatusHistory>("/api/task-statuses/create/", data);
  return res.data;
}