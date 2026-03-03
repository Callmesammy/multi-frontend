"use client";

import {
  CheckCircle2,
  CircleDashed,
  Clock3,
  FileText,
  Flag,
  Sparkles,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import type { CreateTaskRequest } from "@/lib/api/tasks";
import { handleApiError } from "@/lib/utils/errors";

const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required.").max(100, "Max 100 characters."),
  description: z.string().max(500, "Max 500 characters.").optional(),
  status: z.enum(["Todo", "InProgress", "Done"]),
  priority: z.enum(["Low", "Medium", "High"]),
  assigneeId: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  mode: "create" | "edit";
  initialValues?: Partial<CreateTaskRequest>;
  onSubmit: (payload: CreateTaskRequest) => Promise<void>;
  onCancel: () => void;
}

interface StatusOption {
  value: TaskFormValues["status"];
  label: string;
  hint: string;
  icon: LucideIcon;
}

interface PriorityOption {
  value: TaskFormValues["priority"];
  label: string;
  hint: string;
}

const statusOptions: StatusOption[] = [
  { value: "Todo", label: "To do", hint: "Backlog", icon: CircleDashed },
  { value: "InProgress", label: "In progress", hint: "Executing", icon: Clock3 },
  { value: "Done", label: "Done", hint: "Completed", icon: CheckCircle2 },
];

const priorityOptions: PriorityOption[] = [
  { value: "Low", label: "Low", hint: "Can wait" },
  { value: "Medium", label: "Medium", hint: "Normal lane" },
  { value: "High", label: "High", hint: "Urgent focus" },
];

const templates: Array<{
  label: string;
  title: string;
  description: string;
  status: TaskFormValues["status"];
  priority: TaskFormValues["priority"];
}> = [
  {
    label: "Feature",
    title: "Ship new dashboard improvement",
    description:
      "Implement the feature, validate acceptance criteria, and document the release notes for the team.",
    status: "Todo",
    priority: "Medium",
  },
  {
    label: "Hotfix",
    title: "Resolve production edge-case bug",
    description:
      "Investigate root cause, add a regression test, and deploy the patch with rollback notes.",
    status: "InProgress",
    priority: "High",
  },
  {
    label: "Ops",
    title: "Refresh weekly process checklist",
    description:
      "Update recurring tasks and clean stale items so sprint planning starts from a reliable board.",
    status: "Todo",
    priority: "Low",
  },
];

export default function TaskForm({
  mode,
  initialValues,
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    defaultValues: {
      title: initialValues?.title ?? "",
      description: initialValues?.description ?? "",
      status: initialValues?.status ?? "Todo",
      priority: initialValues?.priority ?? "Medium",
      assigneeId: initialValues?.assigneeId ?? "",
    },
  });

  const titleValue = useWatch({ control, name: "title" }) ?? "";
  const descriptionValue = useWatch({ control, name: "description" }) ?? "";
  const statusValue = useWatch({ control, name: "status" }) ?? "Todo";
  const priorityValue = useWatch({ control, name: "priority" }) ?? "Medium";
  const assigneeValue = useWatch({ control, name: "assigneeId" }) ?? "";

  const readiness = useMemo(() => {
    const checks = [
      titleValue.trim().length > 0,
      descriptionValue.trim().length > 0,
      assigneeValue.trim().length > 0,
      statusValue.length > 0,
      priorityValue.length > 0,
    ];

    const doneCount = checks.filter(Boolean).length;
    return Math.round((doneCount / checks.length) * 100);
  }, [assigneeValue, descriptionValue, priorityValue, statusValue, titleValue]);

  const applyTemplate = (template: (typeof templates)[number]) => {
    setValue("title", template.title, { shouldDirty: true, shouldValidate: true });
    setValue("description", template.description, { shouldDirty: true, shouldValidate: true });
    setValue("status", template.status, { shouldDirty: true, shouldValidate: true });
    setValue("priority", template.priority, { shouldDirty: true, shouldValidate: true });
  };

  const handleValidSubmit = async (values: TaskFormValues) => {
    setFormError(null);

    const parsed = taskFormSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (
          field === "title" ||
          field === "description" ||
          field === "status" ||
          field === "priority" ||
          field === "assigneeId"
        ) {
          setError(field, { type: "manual", message: issue.message });
        }
      }
      return;
    }

    try {
      await onSubmit({
        title: parsed.data.title,
        description: parsed.data.description?.trim() || undefined,
        status: parsed.data.status,
        priority: parsed.data.priority,
        assigneeId: parsed.data.assigneeId?.trim() || undefined,
      });
    } catch (error: unknown) {
      setFormError(handleApiError(error));
    }
  };

  return (
    <form onSubmit={handleSubmit(handleValidSubmit)} className="space-y-5" noValidate>
      <input type="hidden" {...register("status")} />
      <input type="hidden" {...register("priority")} />

      <div className="relative overflow-hidden rounded-2xl border border-zinc-300/60 bg-[linear-gradient(135deg,#111827_0%,#0f172a_40%,#9d174d_100%)] p-4 text-zinc-100 sm:p-5">
        <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-fuchsia-400/30 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-8 left-16 h-24 w-24 rounded-full bg-cyan-300/20 blur-2xl" />
        <div className="relative">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">
            <Sparkles className="h-3.5 w-3.5" />
            {mode === "create" ? "Create Mode" : "Edit Mode"}
          </p>
          <h3 className="mt-1 text-xl font-semibold text-white">
            {mode === "create" ? "Craft a new task" : "Update task details"}
          </h3>
          <p className="mt-1 text-sm text-zinc-200">
            Define scope, set urgency, and assign ownership in one pass.
          </p>
        </div>
      </div>

      {mode === "create" ? (
        <section className="space-y-2 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
            Quick Start Templates
          </p>
          <div className="flex flex-wrap gap-2">
            {templates.map((template) => (
              <button
                key={template.label}
                type="button"
                onClick={() => applyTemplate(template)}
                className="rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:border-zinc-500 hover:text-zinc-900"
              >
                {template.label}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="taskTitle" className="text-xs font-medium uppercase tracking-[0.08em] text-zinc-500">
                Title
              </label>
              <span className="text-xs text-zinc-400">{titleValue.trim().length}/100</span>
            </div>
            <input
              id="taskTitle"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900/70 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-400 outline-none transition focus:border-zinc-500"
              placeholder="Write a clear, specific task title"
              {...register("title")}
            />
            {errors.title ? <p className="text-sm text-red-600">{errors.title.message}</p> : null}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="taskDescription" className="text-xs font-medium uppercase tracking-[0.08em] text-zinc-500">
                Description
              </label>
              <span className="text-xs text-zinc-400">{descriptionValue.trim().length}/500</span>
            </div>
            <textarea
              id="taskDescription"
              rows={5}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900/70 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-400 outline-none transition focus:border-zinc-500"
              placeholder="Add context, dependencies, and acceptance criteria"
              {...register("description")}
            />
            {errors.description ? (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-zinc-500">Status</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {statusOptions.map((option) => {
                const Icon = option.icon;
                const selected = statusValue === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setValue("status", option.value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    className={[
                      "rounded-xl border px-3 py-2.5 text-left transition",
                      selected
                        ? "border-zinc-900 bg-zinc-900 text-white shadow-sm"
                        : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-500",
                    ].join(" ")}
                  >
                    <p className="inline-flex items-center gap-2 text-sm font-medium">
                      <Icon className="h-4 w-4" />
                      {option.label}
                    </p>
                    <p className={selected ? "mt-0.5 text-xs text-zinc-300" : "mt-0.5 text-xs text-zinc-500"}>
                      {option.hint}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-zinc-500">Priority</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {priorityOptions.map((option) => {
                const selected = priorityValue === option.value;
                const selectedTone =
                  option.value === "High"
                    ? "border-rose-500 bg-rose-50 text-rose-700"
                    : option.value === "Medium"
                      ? "border-amber-500 bg-amber-50 text-amber-700"
                      : "border-emerald-500 bg-emerald-50 text-emerald-700";

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setValue("priority", option.value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    className={[
                      "rounded-xl border px-3 py-2.5 text-left transition",
                      selected
                        ? selectedTone
                        : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-500",
                    ].join(" ")}
                  >
                    <p className="inline-flex items-center gap-2 text-sm font-medium">
                      <Flag className="h-4 w-4" />
                      {option.label}
                    </p>
                    <p className="mt-0.5 text-xs opacity-80">{option.hint}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="taskAssignee" className="text-xs font-medium uppercase tracking-[0.08em] text-zinc-500">
              Assignee ID
            </label>
            <input
              id="taskAssignee"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900/70 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-400 outline-none transition focus:border-zinc-500"
              placeholder="Optional assignee id"
              {...register("assigneeId")}
            />
          </div>
        </div>

        <aside className="hidden space-y-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 lg:block">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Live Preview
            </p>
            <h4 className="text-base font-semibold text-zinc-900">
              {titleValue.trim() || "Untitled Task"}
            </h4>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700">
                {statusOptions.find((option) => option.value === statusValue)?.label ?? "To do"}
              </span>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  priorityValue === "High"
                    ? "bg-rose-100 text-rose-700"
                    : priorityValue === "Medium"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {priorityValue} Priority
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-3">
            <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
              <UserRound className="h-3.5 w-3.5" />
              Assignee
            </p>
            <p className="mt-1 text-sm font-medium text-zinc-800">
              {assigneeValue.trim() || "Unassigned"}
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-3">
            <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
              <FileText className="h-3.5 w-3.5" />
              Description Snapshot
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-700">
              {descriptionValue.trim() || "No description yet."}
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
                Readiness
              </p>
              <p className="text-xs font-semibold text-zinc-700">{readiness}%</p>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-zinc-700 to-zinc-900 transition-all"
                style={{ width: `${readiness}%` }}
              />
            </div>
          </div>
        </aside>
      </div>

      {errors.status ? <p className="text-sm text-red-600">{errors.status.message}</p> : null}
      {errors.priority ? <p className="text-sm text-red-600">{errors.priority.message}</p> : null}
      {errors.assigneeId ? <p className="text-sm text-red-600">{errors.assigneeId.message}</p> : null}

      {formError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {formError}
        </p>
      ) : null}

      <div className="flex flex-wrap justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50"
        >
          {isSubmitting
            ? mode === "create"
              ? "Creating..."
              : "Saving..."
            : mode === "create"
              ? "Create Task"
              : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
