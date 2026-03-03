"use client";

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
    <section className="rounded-lg border border-zinc-200 bg-white p-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="space-y-1">
          <label htmlFor="statusFilter" className="text-xs font-medium text-zinc-600">
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
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">All</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="priorityFilter" className="text-xs font-medium text-zinc-600">
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
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">All</option>
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="assigneeFilter" className="text-xs font-medium text-zinc-600">
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
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
          />
        </div>

        <div className="flex items-end">
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={onClear}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
            >
              Clear filters
            </button>
          ) : (
            <span className="text-sm text-zinc-500">No active filters</span>
          )}
        </div>
      </div>
    </section>
  );
}
