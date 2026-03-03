"use client";

import { create } from "zustand";

interface OrgState {
  activeOrgId: string | null;
  setActiveOrgId: (orgId: string | null) => void;
}

export const useOrgStore = create<OrgState>((set) => ({
  activeOrgId: null,
  setActiveOrgId: (activeOrgId) => set({ activeOrgId }),
}));
