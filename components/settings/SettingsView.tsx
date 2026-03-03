"use client";

import { useHealth } from "@/lib/hooks/useHealth";

function statusStyle(status?: string): string {
  const normalized = (status ?? "").toLowerCase();

  if (normalized.includes("healthy") || normalized.includes("ok")) {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (normalized.includes("degraded")) {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  if (normalized.includes("unhealthy") || normalized.includes("down")) {
    return "border-red-200 bg-red-50 text-red-800";
  }

  return "border-zinc-200 bg-zinc-50 text-zinc-700";
}

export default function SettingsView() {
  const healthQuery = useHealth();

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-2xl font-semibold text-zinc-900">Settings</h2>
        <p className="text-sm text-zinc-600">
          Workspace status and integration diagnostics.
        </p>
      </header>

      <article className="rounded-lg border border-zinc-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-zinc-900">Backend Health</h3>
          <button
            type="button"
            onClick={() => {
              void healthQuery.refetch();
            }}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
          >
            Refresh
          </button>
        </div>

        {healthQuery.isLoading ? (
          <p className="mt-3 text-sm text-zinc-600">Checking backend status...</p>
        ) : null}

        {healthQuery.isError ? (
          <section className="mt-3 rounded-md border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-700">
              Health check failed. This may indicate backend downtime or CORS
              restrictions.
            </p>
          </section>
        ) : null}

        {healthQuery.data ? (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className={`rounded-md border p-3 ${statusStyle(healthQuery.data.status)}`}>
              <p className="text-xs font-medium uppercase tracking-wide">Backend</p>
              <p className="mt-1 text-sm font-semibold">{healthQuery.data.status}</p>
            </div>

            <div
              className={`rounded-md border p-3 ${statusStyle(
                healthQuery.data.database?.status,
              )}`}
            >
              <p className="text-xs font-medium uppercase tracking-wide">Database</p>
              <p className="mt-1 text-sm font-semibold">
                {healthQuery.data.database?.status ?? "Unknown"}
              </p>
              {healthQuery.data.database?.responseTimeMs != null ? (
                <p className="mt-1 text-xs">
                  {healthQuery.data.database.responseTimeMs}ms
                </p>
              ) : null}
            </div>

            <div
              className={`rounded-md border p-3 ${statusStyle(
                healthQuery.data.cache?.status,
              )}`}
            >
              <p className="text-xs font-medium uppercase tracking-wide">Cache</p>
              <p className="mt-1 text-sm font-semibold">
                {healthQuery.data.cache?.status ?? "Unknown"}
              </p>
              {healthQuery.data.cache?.responseTimeMs != null ? (
                <p className="mt-1 text-xs">{healthQuery.data.cache.responseTimeMs}ms</p>
              ) : null}
            </div>
          </div>
        ) : null}
      </article>
    </section>
  );
}
