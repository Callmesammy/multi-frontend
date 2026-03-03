"use client";

import { useState } from "react";

import TaskFilters from "@/components/tasks/TaskFilters";
import TaskForm from "@/components/tasks/TaskForm";
import TaskTable from "@/components/tasks/TaskTable";
import type { CreateTaskRequest, TaskFilters as TaskFiltersState } from "@/lib/api/tasks";
import {
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useTasks,
  useUpdateTaskMutation,
} from "@/lib/hooks/useTasks";
import type { Task } from "@/types/task";

export default function TaskListView() {
  const [filters, setFilters] = useState<TaskFiltersState>({
    page: 1,
    pageSize: 20,
  });
  const [createOpen, setCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const tasksQuery = useTasks(filters);
  const createTaskMutation = useCreateTaskMutation();
  const updateTaskMutation = useUpdateTaskMutation();
  const deleteTaskMutation = useDeleteTaskMutation();

  const tasks = tasksQuery.data?.data ?? [];
  const page = tasksQuery.data?.page ?? 1;
  const totalPages = tasksQuery.data?.totalPages ?? 1;
  const totalCount = tasksQuery.data?.totalCount ?? 0;

  const resetFilters = () => {
    setFilters({ page: 1, pageSize: 20 });
  };

  const handleCreateTask = async (payload: CreateTaskRequest) => {
    await createTaskMutation.mutateAsync(payload);
    setCreateOpen(false);
  };

  const handleUpdateTask = async (payload: CreateTaskRequest) => {
    if (!editingTask) return;

    await updateTaskMutation.mutateAsync({
      taskId: editingTask.id,
      payload,
    });
    setEditingTask(null);
  };

  const handleDeleteTask = async (taskId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task? This action cannot be undone.",
    );
    if (!confirmed) return;

    await deleteTaskMutation.mutateAsync(taskId);
  };

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-900">Tasks</h2>
          <p className="text-sm text-zinc-600">{totalCount} total tasks</p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          New Task
        </button>
      </header>

      <TaskFilters value={filters} onChange={setFilters} onClear={resetFilters} />

      {tasksQuery.isError ? (
        <section className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">
            Failed to load tasks. Please refresh and try again.
          </p>
        </section>
      ) : null}

      <TaskTable
        tasks={tasks}
        isLoading={tasksQuery.isLoading}
        onEdit={setEditingTask}
        onDelete={(taskId) => {
          void handleDeleteTask(taskId);
        }}
        deletingTaskId={deleteTaskMutation.variables ?? null}
      />

      <footer className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3">
        <p className="text-sm text-zinc-600">
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setFilters((current) => ({ ...current, page: page - 1 }))}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setFilters((current) => ({ ...current, page: page + 1 }))}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </footer>

      {createOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-zinc-950/45 p-4">
          <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-xl">
            <TaskForm
              mode="create"
              onSubmit={handleCreateTask}
              onCancel={() => setCreateOpen(false)}
            />
          </div>
        </div>
      ) : null}

      {editingTask ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-zinc-950/45 p-4">
          <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-xl">
            <TaskForm
              mode="edit"
              initialValues={editingTask}
              onSubmit={handleUpdateTask}
              onCancel={() => setEditingTask(null)}
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
