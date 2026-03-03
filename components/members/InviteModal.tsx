"use client";

import { MailPlus, Send, Sparkles, X } from "lucide-react";
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
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-zinc-950/55 p-4 backdrop-blur-[2px]">
      <button
        type="button"
        className="absolute inset-0"
        onClick={onClose}
        aria-label="Close invite member modal"
      />
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl">
        <div className="relative overflow-hidden border-b border-zinc-200 bg-[linear-gradient(135deg,#111827_0%,#0f172a_45%,#0f766e_100%)] px-5 py-4 text-zinc-50">
          <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-emerald-400/30 blur-2xl" />
          <div className="relative flex items-start justify-between gap-2">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">
                <Sparkles className="h-3.5 w-3.5" />
                Team Access
              </p>
              <h3 className="mt-1 text-lg font-semibold text-white">Invite Member</h3>
              <p className="mt-1 text-sm text-zinc-200">
                Send a secure invite link to join this workspace.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/35 bg-white/10 text-zinc-100 transition hover:bg-white/20"
              aria-label="Close invite member modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <form className="space-y-4 p-5" onSubmit={handleSubmit(handleInviteSubmit)} noValidate>
          <label className="space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-[0.08em] text-zinc-500">
              Email
            </span>
            <span className="relative block">
              <MailPlus className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                id="inviteEmail"
                type="email"
                placeholder="name@company.com"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900/70 py-2.5 pl-9 pr-3 text-sm text-zinc-100 placeholder:text-zinc-400 outline-none transition focus:border-zinc-500"
                {...register("email")}
              />
            </span>
            {errors.email ? <p className="text-sm text-red-600">{errors.email.message}</p> : null}
          </label>

          <p className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
            Invitee receives an email link to join with their existing role assignment.
          </p>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? "Sending..." : "Send Invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
