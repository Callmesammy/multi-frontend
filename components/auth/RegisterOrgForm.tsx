"use client";

import { Bebas_Neue, Manrope } from "next/font/google";
import { gsap } from "gsap";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { registerOrganization } from "@/lib/api/auth";
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

const registerSchema = z
  .object({
    OrganizationName: z
      .string()
      .min(2, "Organization name must be at least 2 characters.")
      .max(50, "Organization name must be at most 50 characters."),
    Name: z.string().min(2, "Your name must be at least 2 characters."),
    Email: z.string().email("Enter a valid email address."),
    Password: z.string().min(8, "Password must be at least 8 characters."),
    ConfirmPassword: z.string().min(8, "Confirm password is required."),
  })
  .refine((values) => values.Password === values.ConfirmPassword, {
    message: "Passwords do not match.",
    path: ["ConfirmPassword"],
  });

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterOrgForm() {
  const router = useRouter();
  const rootRef = useRef<HTMLElement>(null);
  const setAuth = useAuthStore((state) => state.setAuth);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    defaultValues: {
      OrganizationName: "",
      Name: "",
      Email: "",
      Password: "",
      ConfirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterValues) => {
    setApiError(null);

    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (
          field === "OrganizationName" ||
          field === "Name" ||
          field === "Email" ||
          field === "Password" ||
          field === "ConfirmPassword"
        ) {
          setError(field, { type: "manual", message: issue.message });
        }
      }
      return;
    }

    try {
      const response = await registerOrganization({
        OrganizationName: parsed.data.OrganizationName,
        Name: parsed.data.Name,
        Email: parsed.data.Email,
        Password: parsed.data.Password,
      });

      setAuth(response.Token, response.User, response.Organization);
      router.push("/dashboard");
    } catch (error: unknown) {
      setApiError(handleApiError(error));
    }
  };

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });

      intro
        .from("[data-signup='image-pane']", {
          x: -70,
          opacity: 0,
          duration: 0.9,
        })
        .from(
          "[data-signup='topbar']",
          {
            y: -18,
            duration: 0.55,
            clearProps: "transform",
          },
          "-=0.6"
        )
        .from(
          "[data-signup='headline']",
          {
            yPercent: 110,
            opacity: 0,
            duration: 0.86,
          },
          "-=0.45"
        )
        .from(
          "[data-signup='subhead']",
          {
            y: 20,
            opacity: 0,
            duration: 0.55,
          },
          "-=0.52"
        )
        .from(
          "[data-signup='field']",
          {
            y: 24,
            opacity: 0,
            stagger: 0.07,
            duration: 0.5,
          },
          "-=0.35"
        )
        .from(
          "[data-signup='submit']",
          {
            y: 18,
            opacity: 0,
            duration: 0.48,
          },
          "-=0.25"
        );

      gsap.to("[data-signup='rainbow-orb']", {
        scale: 1.12,
        opacity: 0.72,
        repeat: -1,
        yoyo: true,
        duration: 2.1,
        ease: "sine.inOut",
      });

      gsap.to("[data-signup='bar']", {
        backgroundPositionX: "-120%",
        repeat: -1,
        duration: 6,
        ease: "none",
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <main
      ref={rootRef}
      className={`${displayFont.variable} ${bodyFont.variable} relative min-h-screen overflow-hidden bg-[#090909] text-[#f3ebd7] [font-family:var(--font-body)]`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(95,42,255,0.2),transparent_34%),radial-gradient(circle_at_84%_25%,rgba(14,198,255,0.18),transparent_32%)]" />
      <div className="relative grid min-h-screen md:grid-cols-[1.15fr_0.85fr]">
        <aside
          className="relative hidden overflow-hidden border-r border-[#f3ebd72d] md:block"
          data-signup="image-pane"
        >
          <Image
            src="/auth/signup-bg.jpg"
            alt="Colorful abstract paint texture"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/20 to-black/10" />
          <div
            className="absolute inset-0"
            data-signup="bar"
            style={{
              backgroundImage:
                "linear-gradient(120deg, transparent 20%, rgba(255,255,255,0.26) 46%, transparent 66%)",
              backgroundSize: "200% 100%",
            }}
          />
          <div className="absolute bottom-10 left-8 right-8">
            <p className="text-xs uppercase tracking-[0.3em] text-[#f3ebd7cc]">Create your team</p>
            <p
              className="mt-2 text-[clamp(4rem,12vw,10rem)] leading-[0.8] lowercase text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              go vivid
            </p>
            <p className="max-w-sm text-sm text-[#f3ebd7de]">
              Launch your workspace with clean structure and zero setup friction.
            </p>
          </div>
        </aside>

        <section className="relative flex items-center justify-center px-4 py-8 sm:px-8">
          <span
            className="pointer-events-none absolute right-16 top-14 h-36 w-36 rounded-full bg-cyan-400/30 blur-3xl"
            data-signup="rainbow-orb"
          />

          <div className="w-full max-w-lg">
            <header
              className="mb-6 flex items-center justify-between border-b border-[#f3ebd729] pb-3"
              data-signup="topbar"
            >
              <Link
                href="/"
                className="lowercase text-4xl leading-none text-[#f10e37]"
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
                  data-signup="headline"
                >
                  sign up
                </h1>
              </div>
              <p className="mt-1 text-sm text-[#b8afa0]" data-signup="subhead">
                Create your organization and admin account.
              </p>

              <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="space-y-1" data-signup="field">
                  <label className="text-sm font-semibold text-[#f3ebd7]" htmlFor="organizationName">
                    Organization Name
                  </label>
                  <input
                    id="organizationName"
                    className="w-full rounded-md border border-[#f3ebd747] bg-black/30 px-3 py-2 text-sm text-[#f3ebd7] outline-none ring-0 focus:border-cyan-300"
                    {...register("OrganizationName")}
                  />
                  {errors.OrganizationName ? (
                    <p className="text-sm text-red-400">{errors.OrganizationName.message}</p>
                  ) : null}
                </div>

                <div className="space-y-1" data-signup="field">
                  <label className="text-sm font-semibold text-[#f3ebd7]" htmlFor="name">
                    Your Name
                  </label>
                  <input
                    id="name"
                    autoComplete="name"
                    className="w-full rounded-md border border-[#f3ebd747] bg-black/30 px-3 py-2 text-sm text-[#f3ebd7] outline-none ring-0 focus:border-cyan-300"
                    {...register("Name")}
                  />
                  {errors.Name ? <p className="text-sm text-red-400">{errors.Name.message}</p> : null}
                </div>

                <div className="space-y-1" data-signup="field">
                  <label className="text-sm font-semibold text-[#f3ebd7]" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className="w-full rounded-md border border-[#f3ebd747] bg-black/30 px-3 py-2 text-sm text-[#f3ebd7] outline-none ring-0 focus:border-cyan-300"
                    {...register("Email")}
                  />
                  {errors.Email ? <p className="text-sm text-red-400">{errors.Email.message}</p> : null}
                </div>

                <div className="space-y-1" data-signup="field">
                  <label className="text-sm font-semibold text-[#f3ebd7]" htmlFor="password">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    className="w-full rounded-md border border-[#f3ebd747] bg-black/30 px-3 py-2 text-sm text-[#f3ebd7] outline-none ring-0 focus:border-cyan-300"
                    {...register("Password")}
                  />
                  {errors.Password ? (
                    <p className="text-sm text-red-400">{errors.Password.message}</p>
                  ) : null}
                </div>

                <div className="space-y-1" data-signup="field">
                  <label className="text-sm font-semibold text-[#f3ebd7]" htmlFor="confirmPassword">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    className="w-full rounded-md border border-[#f3ebd747] bg-black/30 px-3 py-2 text-sm text-[#f3ebd7] outline-none ring-0 focus:border-cyan-300"
                    {...register("ConfirmPassword")}
                  />
                  {errors.ConfirmPassword ? (
                    <p className="text-sm text-red-400">{errors.ConfirmPassword.message}</p>
                  ) : null}
                </div>

                {apiError ? <p className="text-sm text-red-400">{apiError}</p> : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-md bg-[#f10e37] px-4 py-2.5 text-sm font-semibold text-white  hover:bg-[#ff3159] disabled:cursor-not-allowed disabled:opacity-50"
                  data-signup="submit"
                >
                  {isSubmitting ? "Creating account..." : "Create Organization"}
                </button>
              </form>

              <p className="mt-4 text-sm text-[#b8afa0]" data-signup="field">
                Already have an account?{" "}
                <Link className="font-semibold text-[#f3ebd7] underline" href="/login">
                  Sign in
                </Link>
              </p>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
