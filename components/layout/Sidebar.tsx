"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CheckSquare, LayoutDashboard, LogOut, Settings, Users } from "lucide-react";

import { useAuthStore } from "@/lib/stores/auth.store";

interface SidebarProps {
  compact?: boolean;
  onNavigate?: () => void;
}

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Tasks", href: "/tasks", icon: CheckSquare },
  { label: "Members", href: "/members", icon: Users },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar({ compact = false, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const org = useAuthStore((state) => state.org);
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  return (
    <div className="flex h-full flex-col border-r border-zinc-200 bg-white">
      <div className="border-b border-zinc-200 px-4 py-5">
        <p className="truncate text-xs uppercase tracking-[0.2em] text-zinc-500">
          TeamFlow
        </p>
        <p className="mt-1 truncate text-sm font-semibold text-zinc-900">
          {org?.name ?? "Organization"}
        </p>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={[
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900",
              ].join(" ")}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {compact ? null : <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-200 p-3">
        {compact ? null : (
          <p className="mb-3 truncate text-xs text-zinc-500">
            Signed in as {user?.name ?? "User"}
          </p>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {compact ? null : <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}
