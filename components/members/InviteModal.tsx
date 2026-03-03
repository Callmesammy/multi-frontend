"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";

const inviteSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});

type InviteValues = z.infer<typeof inviteSchema>;

interface InviteModalProps {
  onSubmit: (payload: InviteValues) => Promise<void>;
  onClose: () => void;
}

export default function InviteModal({ onSubmit, onClose }: InviteModalProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<InviteValues>({
    defaultValues: {
      email: "",
    },
  });

  const handleInviteSubmit = async (values: InviteValues) => {
    const parsed = inviteSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        if (issue.path[0] === "email") {
          setError("email", { type: "manual", message: issue.message });
        }
      }
      return;
    }

    await onSubmit(parsed.data);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-zinc-950/45 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-zinc-900">Invite Member</h3>
        <p className="mt-1 text-sm text-zinc-600">
          Send an invite link to this email address.
        </p>

        <form
          className="mt-4 space-y-4"
          onSubmit={handleSubmit(handleInviteSubmit)}
          noValidate
        >
          <div className="space-y-1">
            <label htmlFor="inviteEmail" className="text-sm font-medium text-zinc-700">
              Email
            </label>
            <input
              id="inviteEmail"
              type="email"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              {...register("email")}
            />
            {errors.email ? (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {isSubmitting ? "Sending..." : "Send Invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
