"use client";

import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";

interface TopbarProps {
  onOpenMenu: () => void;
}

const titleMap: Record<string, string> = {
  dashboard: "Dashboard",
  tasks: "Tasks",
  members: "Members",
  settings: "Settings",
};

function toTitle(pathname: string): { title: string; breadcrumb: string } {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return { title: "Dashboard", breadcrumb: "Dashboard" };
  }

  const [first, second] = segments;
  const rootTitle = titleMap[first] ?? "Dashboard";

  if (first === "tasks" && second) {
    return { title: "Task Detail", breadcrumb: `${rootTitle} / Task Detail` };
  }

  return { title: rootTitle, breadcrumb: rootTitle };
}

export default function Topbar({ onOpenMenu }: TopbarProps) {
  const pathname = usePathname();
  const { title, breadcrumb } = toTitle(pathname);

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMenu}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-300 text-zinc-700 md:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              {breadcrumb}
            </p>
            <h1 className="text-base font-semibold text-zinc-900 sm:text-lg">{title}</h1>
          </div>
        </div>
      </div>
    </header>
  );
}
