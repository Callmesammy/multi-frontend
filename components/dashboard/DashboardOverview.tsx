"use client";

import Link from "next/link";
import { ArrowRight, CheckCheck, CircleDashed, Clock3, Gauge, Plus, Sparkles, Users2 } from "lucide-react";
import { useMemo } from "react";

import { useHealth } from "@/lib/hooks/useHealth";
import { useMembers } from "@/lib/hooks/useMembers";
import { useTasks } from "@/lib/hooks/useTasks";
import { useAuthStore } from "@/lib/stores/auth.store";
import type { TaskPriority, TaskStatus } from "@/types/task";

const statusLabels: Record<TaskStatus, string> = {
  Todo: "To do",
  InProgress: "In progress",
  Done: "Done",
};

const priorityLabels: Record<TaskPriority, string> = {
  Low: "Low",
  Medium: "Medium",
  High: "High",
};

const statusOrder: TaskStatus[] = ["Todo", "InProgress", "Done"];
const priorityOrder: TaskPriority[] = ["High", "Medium", "Low"];

function formatLastUpdated(value?: string): string {
  if (!value) return "No activity yet";

  const time = Date.parse(value);
  if (Number.isNaN(time)) return "No activity yet";

  const deltaMinutes = Math.floor((Date.now() - time) / 60_000);

  if (deltaMinutes < 1) return "Updated just now";
  if (deltaMinutes < 60) return `Updated ${deltaMinutes}m ago`;

  const deltaHours = Math.floor(deltaMinutes / 60);
  if (deltaHours < 24) return `Updated ${deltaHours}h ago`;

  const deltaDays = Math.floor(deltaHours / 24);
  if (deltaDays === 1) return "Updated yesterday";
  if (deltaDays < 7) return `Updated ${deltaDays}d ago`;

  return `Updated ${new Date(time).toLocaleDateString()}`;
}

function toPercent(count: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((count / total) * 100);
}

export default function DashboardOverview() {
  const org = useAuthStore((state) => state.org);
  const user = useAuthStore((state) => state.user);

  const tasksQuery = useTasks({ page: 1, pageSize: 100 });
  const membersQuery = useMembers(org?.id);
  const healthQuery = useHealth();

  const taskItems = tasksQuery.data?.data;
  const memberItems = membersQuery.data;
  const tasks = taskItems ?? [];
  const members = memberItems ?? [];

  const summary = useMemo(() => {
    const taskList = taskItems ?? [];
    const memberList = memberItems ?? [];

    const byStatus: Record<TaskStatus, number> = {
      Todo: 0,
      InProgress: 0,
      Done: 0,
    };
    const byPriority: Record<TaskPriority, number> = {
      Low: 0,
      Medium: 0,
      High: 0,
    };

    for (const task of taskList) {
      byStatus[task.status] += 1;
      byPriority[task.priority] += 1;
    }

    const done = byStatus.Done;
    const inProgress = byStatus.InProgress;
    const todo = byStatus.Todo;
    const highOpen = taskList.filter((task) => task.priority === "High" && task.status !== "Done").length;
    const completionRate = toPercent(done, taskList.length);
    const lastTaskUpdate = taskList
      .map((task) => task.updatedAt)
      .sort((a, b) => Date.parse(b) - Date.parse(a))[0];

    const memberNameById = new Map(memberList.map((member) => [member.id, member.name]));
    const spotlight = [...taskList]
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
      .slice(0, 6)
      .map((task) => ({
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        assigneeName: task.assigneeId ? memberNameById.get(task.assigneeId) : undefined,
        updatedAt: task.updatedAt,
      }));

    return {
      byStatus,
      byPriority,
      done,
      inProgress,
      todo,
      highOpen,
      completionRate,
      lastTaskUpdate,
      spotlight,
    };
  }, [memberItems, taskItems]);

  const greetingName = user?.name?.trim().split(" ")[0] || "Team";
  const healthRaw = (healthQuery.data?.status ?? "Unknown").toString();
  const healthLower = healthRaw.toLowerCase();
  const healthTone =
    healthLower === "healthy"
      ? "text-emerald-300 bg-emerald-500/20 border-emerald-400/35"
      : healthLower === "degraded"
        ? "text-amber-200 bg-amber-400/20 border-amber-300/35"
        : "text-zinc-100 bg-zinc-500/25 border-zinc-300/35";

  return (
    <section className="space-y-6 pb-4">
      <div className="relative overflow-hidden rounded-3xl border border-zinc-300/50 bg-[linear-gradient(135deg,#18181b_0%,#0f172a_45%,#881337_100%)] p-6 text-zinc-50 shadow-[0_20px_80px_rgba(15,23,42,0.38)] sm:p-8">
        <div className="pointer-events-none absolute -right-14 -top-16 h-52 w-52 rounded-full bg-pink-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-16 h-44 w-44 rounded-full bg-indigo-400/20 blur-3xl" />

        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-zinc-100">
              <Sparkles className="h-3.5 w-3.5" />
              Mission Control
            </p>
            <div>
              <h2 className="text-2xl font-semibold sm:text-3xl">
                Welcome back, {greetingName}
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-zinc-200 sm:text-base">
                {org?.name ?? "Your organization"} is running with {summary.inProgress} active tasks,{" "}
                {summary.done} completed, and a {summary.completionRate}% completion rate.
              </p>
            </div>
          </div>

          <div className="grid min-w-[240px] gap-2 sm:grid-cols-2">
            <Link
              href="/tasks"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur transition hover:bg-white/20"
            >
              Open tasks
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/members"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100"
            >
              Invite a member
              <Plus className="h-4 w-4" />
            </Link>
            <p className={`rounded-xl border px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] ${healthTone}`}>
              API: {healthRaw}
            </p>
            <p className="rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-zinc-100">
              {formatLastUpdated(summary.lastTaskUpdate)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Tasks</p>
          <p className="mt-2 text-3xl font-semibold text-zinc-900">{tasks.length}</p>
          <p className="mt-1 text-sm text-zinc-600">{summary.todo} waiting to start</p>
        </article>
        <article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">In Progress</p>
          <p className="mt-2 text-3xl font-semibold text-zinc-900">{summary.inProgress}</p>
          <p className="mt-1 text-sm text-zinc-600">Live execution lane</p>
        </article>
        <article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">High Priority</p>
          <p className="mt-2 text-3xl font-semibold text-zinc-900">{summary.highOpen}</p>
          <p className="mt-1 text-sm text-zinc-600">Needs focus today</p>
        </article>
        <article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Members</p>
          <p className="mt-2 text-3xl font-semibold text-zinc-900">{members.length}</p>
          <p className="mt-1 text-sm text-zinc-600">Team in workspace</p>
        </article>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-semibold text-zinc-900">Execution Flow</h3>
            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-600">
              {summary.completionRate}% complete
            </span>
          </div>

          <div className="mt-5 space-y-4">
            {statusOrder.map((status) => {
              const count = summary.byStatus[status];
              const percent = toPercent(count, tasks.length);
              const tone =
                status === "Done"
                  ? "bg-emerald-500"
                  : status === "InProgress"
                    ? "bg-blue-500"
                    : "bg-zinc-500";

              return (
                <div key={status}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <p className="font-medium text-zinc-800">{statusLabels[status]}</p>
                    <p className="text-zinc-600">
                      {count} <span className="text-zinc-400">({percent}%)</span>
                    </p>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                    <div className={`h-full rounded-full ${tone}`} style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {priorityOrder.map((priority) => (
              <div key={priority} className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">
                  {priorityLabels[priority]}
                </p>
                <p className="mt-1 text-2xl font-semibold text-zinc-900">
                  {summary.byPriority[priority]}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-zinc-900">
            <Gauge className="h-5 w-5 text-zinc-600" />
            Team Pulse
          </h3>
          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">Today focus score</p>
              <p className="mt-1 text-3xl font-semibold text-zinc-900">
                {Math.min(100, summary.inProgress * 11 + summary.done * 5 + members.length * 3)}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-xl border border-zinc-200 p-3">
                <p className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                  <CheckCheck className="h-4 w-4 text-emerald-600" />
                  Completed
                </p>
                <p className="mt-1 text-2xl font-semibold text-zinc-900">{summary.done}</p>
              </div>
              <div className="rounded-xl border border-zinc-200 p-3">
                <p className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                  <Clock3 className="h-4 w-4 text-blue-600" />
                  In progress
                </p>
                <p className="mt-1 text-2xl font-semibold text-zinc-900">{summary.inProgress}</p>
              </div>
              <div className="rounded-xl border border-zinc-200 p-3">
                <p className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                  <CircleDashed className="h-4 w-4 text-zinc-600" />
                  Backlog
                </p>
                <p className="mt-1 text-2xl font-semibold text-zinc-900">{summary.todo}</p>
              </div>
              <div className="rounded-xl border border-zinc-200 p-3">
                <p className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                  <Users2 className="h-4 w-4 text-fuchsia-600" />
                  Members
                </p>
                <p className="mt-1 text-2xl font-semibold text-zinc-900">{members.length}</p>
              </div>
            </div>
          </div>
        </article>
      </div>

      <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-zinc-900">Recent Task Activity</h3>
          <Link
            href="/tasks"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-700 hover:text-zinc-900"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {tasksQuery.isLoading ? (
          <p className="mt-4 text-sm text-zinc-600">Loading task timeline...</p>
        ) : tasksQuery.isError ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            Could not load tasks right now.
          </p>
        ) : summary.spotlight.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-5 text-sm text-zinc-600">
            No tasks yet. Create the first task to light up this board.
          </div>
        ) : (
          <div className="mt-4 divide-y divide-zinc-100 rounded-xl border border-zinc-200">
            {summary.spotlight.map((task) => (
              <Link
                key={task.id}
                href={`/tasks/${task.id}`}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 transition hover:bg-zinc-50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-900">{task.title}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {task.assigneeName ? `Assigned to ${task.assigneeName}` : "Unassigned"} -{" "}
                    {formatLastUpdated(task.updatedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-700">
                    {statusLabels[task.status]}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      task.priority === "High"
                        ? "bg-rose-100 text-rose-700"
                        : task.priority === "Medium"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}
