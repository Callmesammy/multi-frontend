"use client";

import { useAuthStore } from "@/lib/stores/auth.store";
import type { UserRole } from "@/types/user";

export function usePermission(role: UserRole) {
  const userRole = useAuthStore((state) => state.user?.role);
  return userRole === role;
}
