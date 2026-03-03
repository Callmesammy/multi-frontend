import type { UserRole } from "@/types/user";

interface RoleBadgeProps {
  role: UserRole;
}

export default function RoleBadge({ role }: RoleBadgeProps) {
  const className =
    role === "Admin"
      ? "bg-amber-100 text-amber-800 border-amber-300"
      : "bg-cyan-100 text-cyan-800 border-cyan-300";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${className}`}
    >
      {role}
    </span>
  );
}
