"use client";

import Link from "next/link";

import Can from "@/components/shared/Can";
import type { Task } from "@/types/task";

interface TaskTableProps {
  tasks: Task[];
  isLoading: boolean;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  deletingTaskId?: string | null;
}

const statusClassMap: Record<Task["status"], string> = {
  Todo: "bg-zinc-100 text-zinc-700",
  InProgress: "bg-amber-100 text-amber-800",
  Done: "bg-emerald-100 text-emerald-800",
};

const priorityClassMap: Record<Task["priority"], string> = {
  Low: "bg-sky-100 text-sky-800",
  Medium: "bg-violet-100 text-violet-800",
  High: "bg-rose-100 text-rose-800",
};

function formatRelativeDate(isoDate: string) {
  const now = Date.now();
  const date = new Date(isoDate).getTime();
  const diffMs = now - date;
  const dayMs = 24 * 60 * 60 * 1000;

  if (Number.isNaN(date)) return "-";
  if (diffMs < dayMs) return "Today";

  const days = Math.floor(diffMs / dayMs);
  return days === 1 ? "1 day ago" : `${days} days ago`;
}

export default function TaskTable({
  tasks,
  isLoading,
  onEdit,
  onDelete,
  deletingTaskId,
}: TaskTableProps) {
  if (isLoading) {
    return (
      <section className="rounded-lg border border-zinc-200 bg-white p-6">
        <p className="text-sm text-zinc-600">Loading tasks...</p>
      </section>
    );
  }

  if (!tasks.length) {
    return (
      <section className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center">
        <h3 className="text-base font-semibold text-zinc-900">No tasks yet</h3>
        <p className="mt-1 text-sm text-zinc-600">Create your first task to get started.</p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-200">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Title
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Priority
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Assignee
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Created
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-zinc-50">
                <td className="px-4 py-3 text-sm font-medium text-zinc-900">
                  <Link className="hover:underline" href={`/tasks/${task.id}`}>
                    {task.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                      statusClassMap[task.status]
                    }`}
                  >
                    {task.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                      priorityClassMap[task.priority]
                    }`}
                  >
                    {task.priority}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-700">
                  {task.assigneeId ?? "Unassigned"}
                </td>
                <td className="px-4 py-3 text-sm text-zinc-700">
                  {formatRelativeDate(task.createdAt)}
                </td>
                <td className="px-4 py-3 text-right text-sm">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(task)}
                      className="rounded-md border border-zinc-300 px-2.5 py-1 font-medium text-zinc-700 hover:bg-zinc-100"
                    >
                      Edit
                    </button>
                    <Can role="Admin">
                      <button
                        type="button"
                        onClick={() => onDelete(task.id)}
                        disabled={deletingTaskId === task.id}
                        className="rounded-md border border-red-200 px-2.5 py-1 font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingTaskId === task.id ? "Deleting..." : "Delete"}
                      </button>
                    </Can>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
