"use client";

import { X } from "lucide-react";
import { useState } from "react";

import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

interface DashboardShellProps {
  children: React.ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="flex min-h-screen">
        <aside className="hidden md:flex md:w-20 md:shrink-0 lg:hidden">
          <Sidebar compact />
        </aside>

        <aside className="hidden lg:flex lg:w-64 lg:shrink-0">
          <Sidebar />
        </aside>

        {mobileOpen ? (
          <div className="fixed inset-0 z-40 md:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-zinc-950/40"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation menu"
            />
            <div className="relative h-full w-72 max-w-[85vw] bg-white shadow-xl">
              <div className="flex items-center justify-end border-b border-zinc-200 px-3 py-2">
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-300 text-zinc-700"
                  aria-label="Close sidebar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar onOpenMenu={() => setMobileOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
