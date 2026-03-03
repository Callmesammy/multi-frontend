"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { login } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/auth.store";
import { handleApiError } from "@/lib/utils/errors";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  organizationId: z.string().uuid("Enter a valid organization ID."),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const lastOrgId = useAuthStore((state) => state.lastOrgId);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    defaultValues: {
      email: "",
      password: "",
      organizationId: lastOrgId ?? "",
    },
  });

  useEffect(() => {
    if (lastOrgId) {
      setValue("organizationId", lastOrgId);
    }
  }, [lastOrgId, setValue]);

  const onSubmit = async (values: LoginValues) => {
    setApiError(null);

    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (field === "email" || field === "password" || field === "organizationId") {
          setError(field, { type: "manual", message: issue.message });
        }
      }
      return;
    }

    try {
      const response = await login(parsed.data);
      setAuth(response.token, response.user, response.organization);
      router.push("/dashboard");
    } catch (error: unknown) {
      setApiError(handleApiError(error));
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">Login</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Sign in to continue to your workspace.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-800" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none ring-0 focus:border-zinc-500"
              {...register("email")}
            />
            {errors.email ? (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-800" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none ring-0 focus:border-zinc-500"
              {...register("password")}
            />
            {errors.password ? (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            ) : null}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-800" htmlFor="organizationId">
              Organization ID
            </label>
            <input
              id="organizationId"
              autoComplete="off"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none ring-0 focus:border-zinc-500"
              {...register("organizationId")}
            />
            {errors.organizationId ? (
              <p className="text-sm text-red-600">{errors.organizationId.message}</p>
            ) : (
              <p className="text-xs text-zinc-500">
                Use the organization ID from your registration response or admin invite.
              </p>
            )}
          </div>

          {apiError ? <p className="text-sm text-red-600">{apiError}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-sm text-zinc-600">
          Need an organization?{" "}
          <Link className="font-medium text-zinc-900 underline" href="/register">
            Register
          </Link>
        </p>
      </section>
    </main>
  );
}
