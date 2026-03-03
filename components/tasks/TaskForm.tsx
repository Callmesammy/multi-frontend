"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
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

export default function TaskForm({
  mode,
  initialValues,
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
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
    <form onSubmit={handleSubmit(handleValidSubmit)} className="space-y-4" noValidate>
      <h3 className="text-lg font-semibold text-zinc-900">
        {mode === "create" ? "Create Task" : "Edit Task"}
      </h3>

      <div className="space-y-1">
        <label htmlFor="taskTitle" className="text-sm font-medium text-zinc-700">
          Title
        </label>
        <input
          id="taskTitle"
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          {...register("title")}
        />
        {errors.title ? <p className="text-sm text-red-600">{errors.title.message}</p> : null}
      </div>

      <div className="space-y-1">
        <label htmlFor="taskDescription" className="text-sm font-medium text-zinc-700">
          Description
        </label>
        <textarea
          id="taskDescription"
          rows={4}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          {...register("description")}
        />
        {errors.description ? (
          <p className="text-sm text-red-600">{errors.description.message}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="taskStatus" className="text-sm font-medium text-zinc-700">
            Status
          </label>
          <select
            id="taskStatus"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            {...register("status")}
          >
            <option value="Todo">Todo</option>
            <option value="InProgress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="taskPriority" className="text-sm font-medium text-zinc-700">
            Priority
          </label>
          <select
            id="taskPriority"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            {...register("priority")}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="taskAssignee" className="text-sm font-medium text-zinc-700">
          Assignee ID
        </label>
        <input
          id="taskAssignee"
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          placeholder="Optional assignee id"
          {...register("assigneeId")}
        />
      </div>

      {formError ? <p className="text-sm text-red-600">{formError}</p> : null}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
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
