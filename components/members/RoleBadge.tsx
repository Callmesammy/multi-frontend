import type { UserRole } from "@/types/user";

interface RoleBadgeProps {
  role: UserRole;
}

export default function RoleBadge({ role }: RoleBadgeProps) {
  const className =
    role === "Admin"
      ? "bg-blue-100 text-blue-800 border-blue-200"
      : "bg-zinc-100 text-zinc-700 border-zinc-200";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${className}`}
    >
      {role}
    </span>
  );
}
