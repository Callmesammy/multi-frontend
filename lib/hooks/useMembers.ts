"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getOrganizationMembers,
  inviteMember,
  type InviteMemberRequest,
} from "@/lib/api/members";

export function useMembers(orgId?: string) {
  return useQuery({
    queryKey: ["members", orgId],
    queryFn: () => getOrganizationMembers(orgId as string),
    enabled: Boolean(orgId),
  });
}

export function useInviteMemberMutation(orgId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: InviteMemberRequest) => inviteMember(orgId as string, payload),
    onSuccess: () => {
      if (!orgId) return;
      void queryClient.invalidateQueries({ queryKey: ["members", orgId] });
    },
  });
}
