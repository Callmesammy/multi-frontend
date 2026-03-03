"use client";

import {
  Activity,
  Building2,
  Database,
  Gauge,
  RefreshCw,
  Server,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useMemo } from "react";

import { useHealth } from "@/lib/hooks/useHealth";
import { useAuthStore } from "@/lib/stores/auth.store";

type HealthTone = "good" | "warn" | "bad" | "neutral";

function normalizeStatus(status?: string): string {
  return status?.trim() || "Unknown";
}

function getTone(status?: string): HealthTone {
  const normalized = (status ?? "").toLowerCase();

  if (normalized.includes("healthy") || normalized.includes("ok")) return "good";
  if (normalized.includes("degraded")) return "warn";
  if (normalized.includes("unhealthy") || normalized.includes("down")) return "bad";

  return "neutral";
}

function toneClass(tone: HealthTone): string {
  if (tone === "good") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (tone === "warn") return "border-amber-200 bg-amber-50 text-amber-800";
  if (tone === "bad") return "border-red-200 bg-red-50 text-red-800";
  return "border-zinc-200 bg-zinc-50 text-zinc-700";
}

function healthScore(status?: string): number {
  const tone = getTone(status);
  if (tone === "good") return 100;
  if (tone === "warn") return 65;
  if (tone === "bad") return 20;
  return 50;
}

function formatCheckTime(value?: string): string {
  if (!value) return "No check timestamp";
  const time = Date.parse(value);
  if (Number.isNaN(time)) return "No check timestamp";

  const delta = Math.floor((Date.now() - time) / 60_000);
  if (delta < 1) return "Checked just now";
  if (delta < 60) return `Checked ${delta}m ago`;
  const hours = Math.floor(delta / 60);
  if (hours < 24) return `Checked ${hours}h ago`;

  return `Checked ${new Date(time).toLocaleString()}`;
}

export default function SettingsView() {
  const healthQuery = useHealth();
  const org = useAuthStore((state) => state.org);
  const user = useAuthStore((state) => state.user);

  const services = useMemo(
    () => [
      {
        key: "backend",
        label: "Backend",
        icon: Server,
        status: normalizeStatus(healthQuery.data?.status),
        latency: undefined,
      },
      {
        key: "database",
        label: "Database",
        icon: Database,
        status: normalizeStatus(healthQuery.data?.database?.status),
        latency: healthQuery.data?.database?.responseTimeMs,
      },
      {
        key: "cache",
        label: "Cache",
        icon: Activity,
        status: normalizeStatus(healthQuery.data?.cache?.status),
        latency: healthQuery.data?.cache?.responseTimeMs,
      },
    ],
    [healthQuery.data],
  );

  const overallScore = useMemo(() => {
    if (!services.length) return 0;
    const total = services.reduce((sum, service) => sum + healthScore(service.status), 0);
    return Math.round(total / services.length);
  }, [services]);

  return (
    <section className="space-y-5">
      <header className="relative overflow-hidden rounded-3xl border border-zinc-300/50 bg-[linear-gradient(135deg,#111827_0%,#0f172a_50%,#0e7490_100%)] p-6 text-zinc-50 shadow-[0_20px_80px_rgba(15,23,42,0.34)] sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-cyan-400/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-14 left-16 h-40 w-40 rounded-full bg-emerald-300/20 blur-3xl" />

        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">
              <Sparkles className="h-3.5 w-3.5" />
              Control Room
            </p>
            <h2 className="mt-1 text-2xl font-semibold sm:text-3xl">Settings & Diagnostics</h2>
            <p className="mt-2 max-w-2xl text-sm text-zinc-200">
              Monitor service reliability, inspect workspace identity, and verify integration health.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              void healthQuery.refetch();
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-white/35 bg-white/15 px-4 py-2.5 text-sm font-medium text-white backdrop-blur transition hover:bg-white/25"
          >
            <RefreshCw className={`h-4 w-4 ${healthQuery.isFetching ? "animate-spin" : ""}`} />
            Refresh Health
          </button>
        </div>

        <div className="relative mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-xl border border-white/25 bg-white/10 p-3.5">
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-300">Health Score</p>
            <p className="mt-1 text-2xl font-semibold">{overallScore}%</p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-zinc-200">
              <Gauge className="h-3.5 w-3.5" />
              Composite status
            </p>
          </article>
          <article className="rounded-xl border border-white/25 bg-white/10 p-3.5">
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-300">Workspace</p>
            <p className="mt-1 truncate text-2xl font-semibold">{org?.name ?? "Organization"}</p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-zinc-200">
              <Building2 className="h-3.5 w-3.5" />
              Org profile
            </p>
          </article>
          <article className="rounded-xl border border-white/25 bg-white/10 p-3.5">
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-300">Your Role</p>
            <p className="mt-1 text-2xl font-semibold">{user?.role ?? "Unknown"}</p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-zinc-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              Access level
            </p>
          </article>
          <article className="rounded-xl border border-white/25 bg-white/10 p-3.5">
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-300">Last Check</p>
            <p className="mt-1 text-xl font-semibold">{formatCheckTime(healthQuery.data?.checkedAt)}</p>
            <p className="mt-1 text-xs text-zinc-200">Auto-refresh every 30s</p>
          </article>
        </div>
      </header>

      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.9fr]">
        <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-zinc-900">Service Status</h3>
          <p className="mt-1 text-sm text-zinc-600">Current health snapshot for backend dependencies.</p>

          {healthQuery.isLoading ? (
            <p className="mt-4 text-sm text-zinc-600">Checking backend status...</p>
          ) : null}

          {healthQuery.isError ? (
            <section className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-700">
                Health check failed. This may indicate backend downtime or CORS restrictions.
              </p>
            </section>
          ) : null}

          {healthQuery.data ? (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {services.map((service) => {
                const Icon = service.icon;
                const tone = getTone(service.status);

                return (
                  <div
                    key={service.key}
                    className={`rounded-xl border p-3 ${toneClass(tone)}`}
                  >
                    <p className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-[0.12em]">
                      <Icon className="h-3.5 w-3.5" />
                      {service.label}
                    </p>
                    <p className="mt-1 text-sm font-semibold">{service.status}</p>
                    <p className="mt-1 text-xs">
                      {service.latency != null ? `${service.latency}ms` : "No latency reported"}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : null}
        </article>

        <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-zinc-900">Workspace Profile</h3>
          <p className="mt-1 text-sm text-zinc-600">Current account and organization context.</p>

          <dl className="mt-4 space-y-3">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
              <dt className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
                <Building2 className="h-3.5 w-3.5" />
                Organization
              </dt>
              <dd className="mt-1 text-sm font-medium text-zinc-900">{org?.name ?? "Unknown"}</dd>
              <dd className="text-xs text-zinc-500">{org?.id ?? "-"}</dd>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
              <dt className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
                <UserRound className="h-3.5 w-3.5" />
                Account
              </dt>
              <dd className="mt-1 text-sm font-medium text-zinc-900">{user?.name ?? "Unknown"}</dd>
              <dd className="text-xs text-zinc-500">{user?.email ?? "-"}</dd>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
              <dt className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
                <ShieldCheck className="h-3.5 w-3.5" />
                Role
              </dt>
              <dd className="mt-1 text-sm font-medium text-zinc-900">{user?.role ?? "Unknown"}</dd>
            </div>
          </dl>
        </article>
      </div>

      <article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-zinc-900">Monitoring Notes</p>
          <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs text-zinc-600">
            Passive checks only
          </span>
        </div>

        <p className="mt-2 text-sm text-zinc-600">
          Health probes refresh automatically every 30 seconds. Manual refresh triggers an immediate
          check, but does not change backend configuration or data.
        </p>
      </article>
    </section>
  );
}
