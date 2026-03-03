"use client";

import { SlidersHorizontal } from "lucide-react";

import type { TaskFilters as TaskFiltersState } from "@/lib/api/tasks";
import type { TaskPriority, TaskStatus } from "@/types/task";

interface TaskFiltersProps {
  value: TaskFiltersState;
  onChange: (value: TaskFiltersState) => void;
  onClear: () => void;
}

const statusOptions: Array<{ label: string; value: TaskStatus }> = [
  { label: "Todo", value: "Todo" },
  { label: "In Progress", value: "InProgress" },
  { label: "Done", value: "Done" },
];

const priorityOptions: Array<{ label: string; value: TaskPriority }> = [
  { label: "Low", value: "Low" },
  { label: "Medium", value: "Medium" },
  { label: "High", value: "High" },
];

export default function TaskFilters({ value, onChange, onClear }: TaskFiltersProps) {
  const hasActiveFilters = Boolean(value.status || value.priority || value.assigneeId);

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </p>
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={onClear}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100"
          >
            Clear all
          </button>
        ) : (
          <span className="text-xs text-zinc-500">No active filters</span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-1.5">
          <label htmlFor="statusFilter" className="text-xs font-medium uppercase tracking-[0.08em] text-zinc-500">
            Status
          </label>
          <select
            id="statusFilter"
            value={value.status ?? ""}
            onChange={(event) =>
              onChange({
                ...value,
                status: event.target.value
                  ? (event.target.value as TaskStatus)
                  : undefined,
                page: 1,
              })
            }
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none ring-0 transition focus:border-zinc-500"
          >
            <option value="">All</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="priorityFilter" className="text-xs font-medium uppercase tracking-[0.08em] text-zinc-500">
            Priority
          </label>
          <select
            id="priorityFilter"
            value={value.priority ?? ""}
            onChange={(event) =>
              onChange({
                ...value,
                priority: event.target.value
                  ? (event.target.value as TaskPriority)
                  : undefined,
                page: 1,
              })
            }
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none ring-0 transition focus:border-zinc-500"
          >
            <option value="">All</option>
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="assigneeFilter" className="text-xs font-medium uppercase tracking-[0.08em] text-zinc-500">
            Assignee ID
          </label>
          <input
            id="assigneeFilter"
            type="text"
            value={value.assigneeId ?? ""}
            placeholder="Filter by assignee id"
            onChange={(event) =>
              onChange({
                ...value,
                assigneeId: event.target.value || undefined,
                page: 1,
              })
            }
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none ring-0 transition focus:border-zinc-500"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="pageSizeFilter" className="text-xs font-medium uppercase tracking-[0.08em] text-zinc-500">
            Page size
          </label>
          <select
            id="pageSizeFilter"
            value={value.pageSize ?? 20}
            onChange={(event) =>
              onChange({
                ...value,
                pageSize: Number(event.target.value) || 20,
                page: 1,
              })
            }
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none ring-0 transition focus:border-zinc-500"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
    </section>
  );
}
