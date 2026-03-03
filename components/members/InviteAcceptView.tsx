"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { acceptInvite } from "@/lib/api/members";
import { useAuthStore } from "@/lib/stores/auth.store";
import { handleApiError } from "@/lib/utils/errors";

const guestAcceptSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type GuestAcceptValues = z.infer<typeof guestAcceptSchema>;

interface InviteAcceptViewProps {
  token: string;
}

export default function InviteAcceptView({ token }: InviteAcceptViewProps) {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const authToken = useAuthStore((state) => state.token);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmittingLoggedIn, setIsSubmittingLoggedIn] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<GuestAcceptValues>({
    defaultValues: {
      name: "",
      password: "",
    },
  });

  const processAccept = async (payload: { name?: string; password?: string }) => {
    setErrorMessage(null);
    const response = await acceptInvite({ token, ...payload });
    setAuth(response.token, response.user, response.organization);
    router.push("/dashboard");
  };

  const handleGuestSubmit = async (values: GuestAcceptValues) => {
    const parsed = guestAcceptSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (field === "name" || field === "password") {
          setError(field, { type: "manual", message: issue.message });
        }
      }
      return;
    }

    try {
      await processAccept(parsed.data);
    } catch (error: unknown) {
      setErrorMessage(handleApiError(error));
    }
  };

  const handleLoggedInAccept = async () => {
    setIsSubmittingLoggedIn(true);
    setErrorMessage(null);
    try {
      await processAccept({});
    } catch (error: unknown) {
      setErrorMessage(handleApiError(error));
    } finally {
      setIsSubmittingLoggedIn(false);
    }
  };

  const expired = (errorMessage ?? "").toLowerCase().includes("expired");

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <section className="w-full max-w-lg rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">Accept Invite</h1>
        <p className="mt-1 text-sm text-zinc-600">
          {authToken
            ? "Join this organization using your current account."
            : "Create your account to join this organization."}
        </p>

        {errorMessage ? (
          <section className="mt-4 rounded-md border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-700">{errorMessage}</p>
            {expired ? (
              <p className="mt-2 text-sm text-red-700">
                This invite appears expired. Contact your organization admin for a
                new invite.
              </p>
            ) : null}
          </section>
        ) : null}

        {authToken ? (
          <div className="mt-5 space-y-4">
            <button
              type="button"
              onClick={() => {
                void handleLoggedInAccept();
              }}
              disabled={isSubmittingLoggedIn}
              className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {isSubmittingLoggedIn ? "Joining..." : "Join Organization"}
            </button>
          </div>
        ) : (
          <form className="mt-5 space-y-4" onSubmit={handleSubmit(handleGuestSubmit)} noValidate>
            <div className="space-y-1">
              <label htmlFor="inviteName" className="text-sm font-medium text-zinc-700">
                Name
              </label>
              <input
                id="inviteName"
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                {...register("name")}
              />
              {errors.name ? <p className="text-sm text-red-600">{errors.name.message}</p> : null}
            </div>

            <div className="space-y-1">
              <label htmlFor="invitePassword" className="text-sm font-medium text-zinc-700">
                Password
              </label>
              <input
                id="invitePassword"
                type="password"
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                {...register("password")}
              />
              {errors.password ? (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {isSubmitting ? "Joining..." : "Create Account and Join"}
            </button>
          </form>
        )}

        <p className="mt-4 text-sm text-zinc-600">
          Back to{" "}
          <Link href="/login" className="font-medium text-zinc-900 underline">
            login
          </Link>
        </p>
      </section>
    </main>
  );
}
