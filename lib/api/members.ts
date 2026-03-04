import axios from "axios";

import { client } from "@/lib/api/client";
import { unwrapApiResponse, type ApiResponse } from "@/lib/api/response";
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

export interface PendingInvite {
  token: string;
  organization?: string;
  createdAt?: string;
  expiresAt?: string;
}

interface BackendAuthResponse {
  userId: string;
  email: string;
  organizationId: string;
  organizationName: string;
  token: string;
  role: string;
}

interface BackendInviteResponse {
  token?: string;
  expiresAt?: string;
  message?: string;
}

interface BackendAcceptInviteRequest {
  token: string;
  password?: string;
  firstName?: string;
  lastName?: string;
}

function deriveDisplayName(email: string): string {
  const localPart = email.split("@")[0];
  return localPart || "User";
}

function mapAuthResponse(payload: BackendAuthResponse): AuthResponse {
  return {
    token: payload.token,
    user: {
      id: payload.userId,
      email: payload.email,
      name: deriveDisplayName(payload.email),
      role: payload.role === "Admin" ? "Admin" : "Member",
    },
    organization: {
      id: payload.organizationId,
      name: payload.organizationName,
    },
  };
}

function splitName(name?: string): { firstName?: string; lastName?: string } {
  if (!name) return {};

  const parts = name
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) return {};
  if (parts.length === 1) return { firstName: parts[0] };

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

export async function getOrganizationMembers(orgId: string): Promise<User[]> {
  const endpoints = [
    `/api/organizations/${orgId}/members`,
    `/api/Organization/${orgId}/members`,
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await client.get<ApiResponse<User[]>>(endpoint);
      return unwrapApiResponse(response.data);
    } catch (error: unknown) {
      if (!axios.isAxiosError(error) || error.response?.status !== 404) {
        throw error;
      }
    }
  }

  // Keep members screen usable when endpoint rollout lags behind frontend deploy.
  return [];
}

export async function inviteMember(
  orgId: string,
  payload: InviteMemberRequest,
): Promise<InviteMemberResponse> {
  const endpoints = [
    `/api/Invite/organizations/${orgId}`,
    `/api/invites/organizations/${orgId}`,
  ];

  let lastError: unknown;
  for (const endpoint of endpoints) {
    try {
      const response = await client.post<ApiResponse<BackendInviteResponse>>(
        endpoint,
        payload,
      );

      const data = unwrapApiResponse(response.data);
      return { message: data.message ?? response.data.message ?? undefined };
    } catch (error: unknown) {
      lastError = error;
      if (!axios.isAxiosError(error) || error.response?.status !== 404) {
        throw error;
      }
    }
  }

  throw lastError ?? new Error("Invite endpoint not found.");
}

export async function acceptInvite(payload: AcceptInviteRequest): Promise<AuthResponse> {
  const nameParts = splitName(payload.name);
  const backendPayload: BackendAcceptInviteRequest = {
    token: payload.token,
    password: payload.password,
    firstName: nameParts.firstName,
    lastName: nameParts.lastName,
  };

  const endpoints = ["/api/Invite/accept", "/api/invites/accept"];
  let lastError: unknown;

  for (const endpoint of endpoints) {
    try {
      const response = await client.post<ApiResponse<BackendAuthResponse>>(
        endpoint,
        backendPayload,
      );
      return mapAuthResponse(unwrapApiResponse(response.data));
    } catch (error: unknown) {
      lastError = error;
      if (!axios.isAxiosError(error) || error.response?.status !== 404) {
        throw error;
      }
    }
  }

  throw lastError ?? new Error("Accept invite endpoint not found.");
}

export async function getPendingInvites(): Promise<PendingInvite[]> {
  const endpoints = ["/api/invites/pending", "/api/Invite/pending"];

  for (const endpoint of endpoints) {
    try {
      const response = await client.get<ApiResponse<PendingInvite[]>>(endpoint);
      return unwrapApiResponse(response.data);
    } catch (error: unknown) {
      if (!axios.isAxiosError(error) || error.response?.status !== 404) {
        throw error;
      }
    }
  }

  return [];
}
