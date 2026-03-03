import { client } from "@/lib/api/client";
import type { AuthResponse } from "@/types/auth";
import type { User } from "@/types/user";

export interface InviteMemberRequest {
  email: string;
}

export interface AcceptInviteRequest {
  token: string;
  name?: string;
  password?: string;
}

export interface InviteMemberResponse {
  message?: string;
}

export async function getOrganizationMembers(orgId: string): Promise<User[]> {
  const response = await client.get<User[]>(`/api/organizations/${orgId}/members`);
  return response.data;
}

export async function inviteMember(
  orgId: string,
  payload: InviteMemberRequest,
): Promise<InviteMemberResponse> {
  const response = await client.post<InviteMemberResponse>(
    `/api/organizations/${orgId}/invites`,
    payload,
  );
  return response.data;
}

export async function acceptInvite(payload: AcceptInviteRequest): Promise<AuthResponse> {
  const response = await client.post<AuthResponse>("/api/invites/accept", payload);
  return response.data;
}
