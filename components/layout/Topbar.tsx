"use client";

import Image from "next/image";
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
    <header className="sticky top-0 z-20 bg-zinc-950/70 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-zinc-700/70 to-transparent" />
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMenu}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-700 text-zinc-200 hover:bg-zinc-900 md:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-4 w-4" />
          </button>
          <Image
            src="/brand/teamflow-mark.svg"
            alt="TeamFlow"
            width={22}
            height={22}
            className="h-5 w-5 shrink-0"
          />
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">
              {breadcrumb}
            </p>
            <h1 className="text-base font-semibold text-zinc-100 sm:text-lg">{title}</h1>
          </div>
        </div>
      </div>
    </header>
  );
}
