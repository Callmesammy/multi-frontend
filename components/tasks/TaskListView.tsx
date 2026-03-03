"use client";

import { Activity, CalendarClock, CheckCircle2, ClipboardList, Flame, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";

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

  const taskItems = tasksQuery.data?.data;
  const tasks = taskItems ?? [];
  const page = tasksQuery.data?.page ?? 1;
  const totalPages = tasksQuery.data?.totalPages ?? 1;
  const totalCount = tasksQuery.data?.totalCount ?? 0;
  const pageSize = tasksQuery.data?.pageSize ?? filters.pageSize ?? 20;

  const stats = useMemo(() => {
    const list = taskItems ?? [];
    let todo = 0;
    let inProgress = 0;
    let done = 0;
    let highPriority = 0;

    for (const task of list) {
      if (task.status === "Todo") todo += 1;
      if (task.status === "InProgress") inProgress += 1;
      if (task.status === "Done") done += 1;
      if (task.priority === "High") highPriority += 1;
    }

    return { todo, inProgress, done, highPriority };
  }, [taskItems]);

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
    <section className="space-y-5">
      <header className="relative overflow-hidden rounded-3xl border border-zinc-300/50 bg-[linear-gradient(135deg,#09090b_0%,#0f172a_60%,#1d4ed8_100%)] p-6 text-zinc-50 shadow-[0_20px_80px_rgba(9,9,11,0.35)] sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-14 h-44 w-44 rounded-full bg-blue-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 left-10 h-36 w-36 rounded-full bg-cyan-400/20 blur-3xl" />

        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-300">
              Workstream
            </p>
            <h2 className="mt-1 text-2xl font-semibold sm:text-3xl">Task Command Center</h2>
            <p className="mt-2 max-w-2xl text-sm text-zinc-200">
              Track delivery, isolate blockers, and keep the entire team focused on the next move.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-white/35 bg-white/15 px-4 py-2.5 text-sm font-medium text-white backdrop-blur transition hover:bg-white/25"
          >
            <Plus className="h-4 w-4" />
            New Task
          </button>
        </div>

        <div className="relative mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-xl border border-white/25 bg-white/10 p-3.5">
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-300">Total in org</p>
            <p className="mt-1 text-2xl font-semibold">{totalCount}</p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-zinc-200">
              <ClipboardList className="h-3.5 w-3.5" />
              Across all pages
            </p>
          </article>
          <article className="rounded-xl border border-white/25 bg-white/10 p-3.5">
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-300">In progress</p>
            <p className="mt-1 text-2xl font-semibold">{stats.inProgress}</p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-zinc-200">
              <Activity className="h-3.5 w-3.5" />
              On this page
            </p>
          </article>
          <article className="rounded-xl border border-white/25 bg-white/10 p-3.5">
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-300">Completed</p>
            <p className="mt-1 text-2xl font-semibold">{stats.done}</p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-zinc-200">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Done lane
            </p>
          </article>
          <article className="rounded-xl border border-white/25 bg-white/10 p-3.5">
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-300">High priority</p>
            <p className="mt-1 text-2xl font-semibold">{stats.highPriority}</p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-zinc-200">
              <Flame className="h-3.5 w-3.5" />
              {stats.todo} waiting to start
            </p>
          </article>
        </div>
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

      <footer className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
        <p className="inline-flex items-center gap-2 text-sm text-zinc-600">
          <CalendarClock className="h-4 w-4" />
          Page {page} of {totalPages} <span className="text-zinc-400">({pageSize} per page)</span>
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setFilters((current) => ({ ...current, page: page - 1 }))}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setFilters((current) => ({ ...current, page: page + 1 }))}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </footer>

      {createOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-zinc-950/55 p-4 backdrop-blur-[2px]">
          <button
            type="button"
            className="absolute inset-0"
            onClick={() => setCreateOpen(false)}
            aria-label="Close create task modal"
          />
          <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl">
            <div className="flex items-center justify-end border-b border-zinc-200 px-3 py-2">
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-300 text-zinc-700 transition hover:bg-zinc-100"
                aria-label="Close create task modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[82vh] overflow-y-auto p-4 sm:p-5">
              <TaskForm
                mode="create"
                onSubmit={handleCreateTask}
                onCancel={() => setCreateOpen(false)}
              />
            </div>
          </div>
        </div>
      ) : null}

      {editingTask ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-zinc-950/45 p-4">
          <button
            type="button"
            className="absolute inset-0"
            onClick={() => setEditingTask(null)}
            aria-label="Close edit task modal"
          />
          <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl">
            <div className="flex items-center justify-end border-b border-zinc-200 px-3 py-2">
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-300 text-zinc-700 transition hover:bg-zinc-100"
                aria-label="Close edit task modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[82vh] overflow-y-auto p-5">
              <TaskForm
                mode="edit"
                initialValues={editingTask}
                onSubmit={handleUpdateTask}
                onCancel={() => setEditingTask(null)}
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
