import { client } from "@/lib/api/client";
import { unwrapApiResponse, type ApiResponse } from "@/lib/api/response";
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

interface BackendTask {
  id: string;
  title: string;
  description?: string;
  status: number;
  priority: number;
  organizationId: string;
  assigneeId?: string;
  createdAt: string;
  updatedAt: string;
}

interface BackendPaginatedTasks {
  items: BackendTask[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

interface BackendCreateTaskRequest {
  title: string;
  description?: string;
  priority: number;
  assigneeId?: string;
}

interface BackendUpdateTaskRequest {
  title: string;
  description?: string;
  status: number;
  priority: number;
  assigneeId?: string;
}

const taskStatusToNumber: Record<TaskStatus, number> = {
  Todo: 1,
  InProgress: 2,
  Done: 3,
};

const taskPriorityToNumber: Record<TaskPriority, number> = {
  Low: 1,
  Medium: 2,
  High: 3,
};

const numberToTaskStatus: Record<number, TaskStatus> = {
  1: "Todo",
  2: "InProgress",
  3: "Done",
};

const numberToTaskPriority: Record<number, TaskPriority> = {
  1: "Low",
  2: "Medium",
  3: "High",
};

function mapTask(task: BackendTask): Task {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: numberToTaskStatus[task.status] ?? "Todo",
    priority: numberToTaskPriority[task.priority] ?? "Medium",
    assigneeId: task.assigneeId,
    organizationId: task.organizationId,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}

export async function getTasks(
  filters: TaskFilters,
): Promise<PaginatedResponse<Task>> {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;

  const response = await client.get<ApiResponse<BackendPaginatedTasks>>(
    "/api/Task/paginated",
    {
      params: {
        skip: (page - 1) * pageSize,
        take: pageSize,
        status: filters.status ? taskStatusToNumber[filters.status] : undefined,
        priority: filters.priority
          ? taskPriorityToNumber[filters.priority]
          : undefined,
        assigneeId: filters.assigneeId,
      },
    },
  );
  const payload = unwrapApiResponse(response.data);

  return {
    data: (payload.items ?? []).map(mapTask),
    page: payload.pageNumber ?? page,
    pageSize: payload.pageSize ?? pageSize,
    totalCount: payload.totalCount ?? 0,
    totalPages: payload.totalPages ?? 1,
  };
}

export async function getTask(taskId: string): Promise<Task> {
  const response = await client.get<ApiResponse<BackendTask>>(`/api/Task/${taskId}`);
  return mapTask(unwrapApiResponse(response.data));
}

export async function createTask(payload: CreateTaskRequest): Promise<Task> {
  const backendPayload: BackendCreateTaskRequest = {
    title: payload.title,
    description: payload.description,
    priority: taskPriorityToNumber[payload.priority],
    assigneeId: payload.assigneeId,
  };

  const response = await client.post<ApiResponse<BackendTask>>(
    "/api/Task",
    backendPayload,
  );
  return mapTask(unwrapApiResponse(response.data));
}

export async function updateTask(
  taskId: string,
  payload: UpdateTaskRequest,
): Promise<Task> {
  const backendPayload: BackendUpdateTaskRequest = {
    title: payload.title,
    description: payload.description,
    status: taskStatusToNumber[payload.status],
    priority: taskPriorityToNumber[payload.priority],
    assigneeId: payload.assigneeId,
  };

  const response = await client.put<ApiResponse<BackendTask>>(
    `/api/Task/${taskId}`,
    backendPayload,
  );
  return mapTask(unwrapApiResponse(response.data));
}

export async function deleteTask(taskId: string): Promise<void> {
  await client.delete(`/api/Task/${taskId}`);
}
