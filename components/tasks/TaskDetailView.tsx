"use client";

import Link from "next/link";
import { useState } from "react";

import Can from "@/components/shared/Can";
import TaskForm from "@/components/tasks/TaskForm";
import type { CreateTaskRequest } from "@/lib/api/tasks";
import {
  useDeleteTaskMutation,
  useTask,
  useUpdateTaskMutation,
} from "@/lib/hooks/useTasks";

interface TaskDetailViewProps {
  taskId: string;
}

export default function TaskDetailView({ taskId }: TaskDetailViewProps) {
  const [editing, setEditing] = useState(false);

  const taskQuery = useTask(taskId);
  const updateTaskMutation = useUpdateTaskMutation();
  const deleteTaskMutation = useDeleteTaskMutation();

  const task = taskQuery.data;

  const handleUpdate = async (payload: CreateTaskRequest) => {
    await updateTaskMutation.mutateAsync({ taskId, payload });
    setEditing(false);
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this task?")) return;
    await deleteTaskMutation.mutateAsync(taskId);
    window.location.href = "/tasks";
  };

  if (taskQuery.isLoading) {
    return <p className="text-sm text-zinc-600">Loading task...</p>;
  }

  if (taskQuery.isError || !task) {
    return (
      <section className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-700">Task not found or failed to load.</p>
        <Link href="/tasks" className="mt-3 inline-block text-sm font-medium underline">
          Back to tasks
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <Link href="/tasks" className="inline-block text-sm font-medium text-zinc-700 underline">
        Back to tasks
      </Link>

      <article className="rounded-lg border border-zinc-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className="text-2xl font-semibold text-zinc-900">{task.title}</h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
            >
              Edit
            </button>
            <Can role="Admin">
              <button
                type="button"
                onClick={() => {
                  void handleDelete();
                }}
                disabled={deleteTaskMutation.isPending}
                className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                {deleteTaskMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </Can>
          </div>
        </div>

        <p className="mt-4 whitespace-pre-wrap text-sm text-zinc-700">
          {task.description || "No description."}
        </p>

        <dl className="mt-6 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium text-zinc-500">Status</dt>
            <dd className="mt-1 text-zinc-900">{task.status}</dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-500">Priority</dt>
            <dd className="mt-1 text-zinc-900">{task.priority}</dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-500">Assignee</dt>
            <dd className="mt-1 text-zinc-900">{task.assigneeId ?? "Unassigned"}</dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-500">Created</dt>
            <dd className="mt-1 text-zinc-900">
              {new Date(task.createdAt).toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-500">Updated</dt>
            <dd className="mt-1 text-zinc-900">
              {new Date(task.updatedAt).toLocaleString()}
            </dd>
          </div>
        </dl>
      </article>

      {editing ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-zinc-950/45 p-4">
          <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-xl">
            <TaskForm
              mode="edit"
              initialValues={task}
              onSubmit={handleUpdate}
              onCancel={() => setEditing(false)}
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
