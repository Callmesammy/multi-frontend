import { client } from "@/lib/api/client";
import type { PaginatedResponse } from "@/types/pagination";
import type { Task, TaskPriority, TaskStatus } from "@/types/task";

export interface TaskFilters {
  page?: number;
  pageSize?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
}

export type UpdateTaskRequest = CreateTaskRequest;

export async function getTasks(
  filters: TaskFilters,
): Promise<PaginatedResponse<Task>> {
  const response = await client.get<PaginatedResponse<Task>>("/api/tasks", {
    params: filters,
  });
  return response.data;
}

export async function getTask(taskId: string): Promise<Task> {
  const response = await client.get<Task>(`/api/tasks/${taskId}`);
  return response.data;
}

export async function createTask(payload: CreateTaskRequest): Promise<Task> {
  const response = await client.post<Task>("/api/tasks", payload);
  return response.data;
}

export async function updateTask(
  taskId: string,
  payload: UpdateTaskRequest,
): Promise<Task> {
  const response = await client.put<Task>(`/api/tasks/${taskId}`, payload);
  return response.data;
}

export async function deleteTask(taskId: string): Promise<void> {
  await client.delete(`/api/tasks/${taskId}`);
}
