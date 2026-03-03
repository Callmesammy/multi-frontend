import axios from "axios";

import type {
  AuthResponse,
  LoginRequest,
  RegisterOrganizationRequest,
} from "@/types/auth";

import { client } from "@/lib/api/client";
import { unwrapApiResponse, type ApiResponse } from "@/lib/api/response";

interface BackendAuthResponse {
  userId: string;
  email: string;
  organizationId: string;
  organizationName: string;
  token: string;
  role: string;
}

interface BackendRegisterOrganizationRequest {
  organizationName: string;
  adminEmail: string;
  adminPassword: string;
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

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  const response = await client.post<ApiResponse<BackendAuthResponse>>(
    "/api/Auth/login",
    null,
    {
      params: {
        email: payload.email,
        password: payload.password,
        organizationId: payload.organizationId,
      },
    },
  );

  return mapAuthResponse(unwrapApiResponse(response.data));
}

export async function registerOrganization(
  payload: RegisterOrganizationRequest,
): Promise<AuthResponse> {
  const backendPayload: BackendRegisterOrganizationRequest = {
    organizationName: payload.organizationName,
    adminEmail: payload.email,
    adminPassword: payload.password,
  };

  const registerEndpoints = [
    "/api/Auth/register-organization",
    "/api/auth/register",
    "/api/organizations",
  ];
  let lastError: unknown;

  for (const endpoint of registerEndpoints) {
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

  throw lastError ?? new Error("Registration endpoint not found.");
}
