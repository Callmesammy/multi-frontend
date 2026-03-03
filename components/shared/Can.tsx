"use client";

import type { ReactNode } from "react";

import { usePermission } from "@/lib/hooks/usePermission";
import type { UserRole } from "@/types/user";

interface CanProps {
  role: UserRole;
  children: ReactNode;
  fallback?: ReactNode;
}

export default function Can({ role, children, fallback = null }: CanProps) {
  const allowed = usePermission(role);
  return allowed ? <>{children}</> : <>{fallback}</>;
}
