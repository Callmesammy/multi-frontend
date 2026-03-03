"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";

import {
  createTask,
  deleteTask,
  getTask,
  getTasks,
  type CreateTaskRequest,
  type TaskFilters,
  type UpdateTaskRequest,
  updateTask,
} from "@/lib/api/tasks";
import type { PaginatedResponse } from "@/types/pagination";
import type { Task } from "@/types/task";

const TASKS_QUERY_KEY = "tasks";

export function useTasks(filters: TaskFilters) {
  return useQuery({
    queryKey: [TASKS_QUERY_KEY, filters],
    queryFn: () => getTasks(filters),
    placeholderData: (previous) => previous,
  });
}

export function useTask(taskId: string) {
  return useQuery({
    queryKey: ["task", taskId],
    queryFn: () => getTask(taskId),
    enabled: Boolean(taskId),
  });
}

export function useCreateTaskMutation(): UseMutationResult<Task, unknown, CreateTaskRequest> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
    },
  });
}

export function useUpdateTaskMutation(): UseMutationResult<
  Task,
  unknown,
  { taskId: string; payload: UpdateTaskRequest }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId: id, payload }) => updateTask(id, payload),
    onMutate: async ({ taskId: id, payload }) => {
      await queryClient.cancelQueries({ queryKey: [TASKS_QUERY_KEY] });
      const previousTasks = queryClient.getQueriesData<PaginatedResponse<Task>>({
        queryKey: [TASKS_QUERY_KEY],
      });

      for (const [key, data] of previousTasks) {
        if (!data) continue;

        queryClient.setQueryData<PaginatedResponse<Task>>(key, {
          ...data,
          data: data.data.map((task) =>
            task.id === id ? { ...task, ...payload, updatedAt: new Date().toISOString() } : task,
          ),
        });
      }

      const previousTask = id
        ? queryClient.getQueryData<Task>(["task", id])
        : undefined;

      if (id && previousTask) {
        queryClient.setQueryData<Task>(["task", id], {
          ...previousTask,
          ...payload,
          updatedAt: new Date().toISOString(),
        });
      }

      return { previousTasks, previousTask, id };
    },
    onError: (_error, _variables, context) => {
      if (!context) return;

      for (const [key, data] of context.previousTasks) {
        queryClient.setQueryData(key, data);
      }

      if (context.id && context.previousTask) {
        queryClient.setQueryData(["task", context.id], context.previousTask);
      }
    },
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
      void queryClient.invalidateQueries({ queryKey: ["task", variables.taskId] });
    },
  });
}

export function useDeleteTaskMutation(): UseMutationResult<void, unknown, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
    },
  });
}
