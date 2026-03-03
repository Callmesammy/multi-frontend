"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Organization } from "@/types/organization";
import type { User } from "@/types/user";

interface AuthState {
  token: string | null;
  user: User | null;
  org: Organization | null;
  lastOrgId: string | null;
  setAuth: (token: string, user: User, org: Organization) => void;
  clearAuth: () => void;
}

const AUTH_COOKIE_NAME = "teamflow-token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

function setAuthCookie(token: string) {
  if (typeof document === "undefined") return;

  document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(
    token,
  )}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
}

function clearAuthCookie() {
  if (typeof document === "undefined") return;

  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      org: null,
      lastOrgId: null,
      setAuth: (token, user, org) => {
        setAuthCookie(token);
        set({ token, user, org, lastOrgId: org.id });
      },
      clearAuth: () => {
        clearAuthCookie();
        set({ token: null, user: null, org: null });
      },
    }),
    {
      name: "teamflow-auth",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          setAuthCookie(state.token);
          return;
        }

        clearAuthCookie();
      },
    },
  ),
);
