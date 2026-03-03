"use client";

import { Bebas_Neue, Manrope } from "next/font/google";
import { gsap } from "gsap";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { login } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/auth.store";
import { handleApiError } from "@/lib/utils/errors";

const displayFont = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

const bodyFont = Manrope({
  subsets: ["latin"],
  weight: ["500", "700", "800"],
  variable: "--font-body",
});

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  organizationId: z.string().uuid("Enter a valid organization ID."),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const rootRef = useRef<HTMLElement>(null);
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

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });

      intro
        .from("[data-auth='image-pane']", {
          x: -60,
          opacity: 0,
          duration: 0.9,
        })
        .from(
          "[data-auth='topbar']",
          {
            y: -28,
            opacity: 0,
            duration: 0.7,
          },
          "-=0.55"
        )
        .from(
          "[data-auth='headline']",
          {
            yPercent: 110,
            opacity: 0,
            duration: 0.85,
          },
          "-=0.5"
        )
        .from(
          "[data-auth='subhead']",
          {
            y: 22,
            opacity: 0,
            duration: 0.6,
          },
          "-=0.5"
        )
        .from(
          "[data-auth='field']",
          {
            y: 24,
            opacity: 0,
            stagger: 0.08,
            duration: 0.52,
          },
          "-=0.4"
        )
        .from(
          "[data-auth='submit']",
          {
            y: 20,
            opacity: 0,
            duration: 0.5,
          },
          "-=0.3"
        );

      gsap.to("[data-auth='pulse']", {
        scale: 1.08,
        opacity: 0.75,
        repeat: -1,
        yoyo: true,
        duration: 1.9,
        ease: "sine.inOut",
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

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
    <main
      ref={rootRef}
      className={`${displayFont.variable} ${bodyFont.variable} relative min-h-screen overflow-hidden bg-[#090909] text-[#f3ebd7] [font-family:var(--font-body)]`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_15%,rgba(241,14,55,0.2),transparent_34%),radial-gradient(circle_at_85%_22%,rgba(243,235,215,0.12),transparent_28%)]" />
      <div className="relative grid min-h-screen md:grid-cols-[1.15fr_0.85fr]">
        <aside
          className="relative hidden overflow-hidden border-r border-[#f3ebd72d] md:block"
          data-auth="image-pane"
        >
          <Image
            src="/auth/login-bg.jpg"
            alt="Abstract dark background"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_35%,rgba(241,14,55,0.34),transparent_40%)]" />
          <div className="absolute bottom-10 left-8 right-8">
            <p className="text-xs uppercase tracking-[0.3em] text-[#f3ebd7b5]">
              TeamFlow Workspace
            </p>
            <p
              className="mt-2 text-[clamp(4rem,13vw,11rem)] leading-[0.8] lowercase text-[#f3ebd7]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              stay sharp
            </p>
            <p className="max-w-sm text-sm text-[#f3ebd7c7]">
              Manage tasks, owners, and deadlines without leaving the flow.
            </p>
          </div>
        </aside>

        <section className="relative flex items-center justify-center px-4 py-8 sm:px-8">
          <span
            className="pointer-events-none absolute right-14 top-14 h-36 w-36 rounded-full bg-[#f10e37]/30 blur-3xl"
            data-auth="pulse"
          />

          <div className="w-full max-w-md">
            <header
              className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-[#f3ebd729] pb-3"
              data-auth="topbar"
            >
              <Link
                href="/"
                className="lowercase text-3xl leading-none text-[#f10e37] sm:text-4xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                hourly
              </Link>
            
            </header>

            <section className="rounded-2xl border border-[#f3ebd72e] bg-[#0e0e0e]/90 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)] sm:p-8">
              <div className="overflow-hidden">
                <h1
                  className="lowercase text-[clamp(2.8rem,8vw,5rem)] leading-[0.82] text-[#f3ebd7]"
                  style={{ fontFamily: "var(--font-display)" }}
                  data-auth="headline"
                >
                  login
                </h1>
              </div>
              <p className="mt-1 text-sm text-[#b8afa0]" data-auth="subhead">
                Sign in to continue to your workspace.
              </p>
    
              <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="space-y-1" data-auth="field">
                  <label className="text-sm font-semibold text-[#f3ebd7]" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className="w-full rounded-md border border-[#f3ebd747] bg-black/30 px-3 py-2 text-sm text-[#f3ebd7] outline-none ring-0 placeholder:text-[#f3ebd771] focus:border-[#f10e37]"
                    placeholder="you@company.com"
                    {...register("email")}
                  />
                  {errors.email ? (
                    <p className="text-sm text-red-400">{errors.email.message}</p>
                  ) : null}
                </div>

                <div className="space-y-1" data-auth="field">
                  <label className="text-sm font-semibold text-[#f3ebd7]" htmlFor="password">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    className="w-full rounded-md border border-[#f3ebd747] bg-black/30 px-3 py-2 text-sm text-[#f3ebd7] outline-none ring-0 focus:border-[#f10e37]"
                    {...register("password")}
                  />
                  {errors.password ? (
                    <p className="text-sm text-red-400">{errors.password.message}</p>
                  ) : null}
                </div>

                <div className="space-y-1" data-auth="field">
                  <label className="text-sm font-semibold text-[#f3ebd7]" htmlFor="organizationId">
                    Organization ID
                  </label>
                  <input
                    id="organizationId"
                    autoComplete="off"
                    className="w-full rounded-md border border-[#f3ebd747] bg-black/30 px-3 py-2 text-sm text-[#f3ebd7] outline-none ring-0 focus:border-[#f10e37]"
                    {...register("organizationId")}
                  />
                  {errors.organizationId ? (
                    <p className="text-sm text-red-400">{errors.organizationId.message}</p>
                  ) : (
                    <p className="text-xs text-[#b8afa0]">
                      Use the organization ID from your registration response or admin invite.
                    </p>
                  )}
                </div>

                {apiError ? <p className="text-sm text-red-400">{apiError}</p> : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-md bg-[#f10e37] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#ff3159] disabled:cursor-not-allowed disabled:opacity-50"
                  data-auth="submit"
                >
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </button>
              </form>

              <p className="mt-4 text-sm text-[#b8afa0]" data-auth="field">
                Need an organization?{" "}
                <Link className="font-semibold text-[#f3ebd7] underline" href="/register">
                  Register
                </Link>
              </p>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
