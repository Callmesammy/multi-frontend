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
  email: string;
  password: string;
  adminEmail: string;
  adminPassword: string;
}

function deriveDisplayName(email: string): string {
  const localPart = email.split("@")[0];
  return localPart || "User";
}

function mapAuthResponse(payload: BackendAuthResponse): AuthResponse {
  return {
    Token: payload.token,
    User: {
      id: payload.userId,
      email: payload.email,
      name: deriveDisplayName(payload.email),
      role: payload.role === "Admin" ? "Admin" : "Member",
    },
    Organization: {
      id: payload.organizationId,
      name: payload.organizationName,
    },
  };
}

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  const endpoints = ["/api/auth/login", "/api/Auth/login"];
  let lastError: unknown;

  for (const endpoint of endpoints) {
    try {
      const response = await client.post<ApiResponse<BackendAuthResponse>>(
        endpoint,
        null,
        {
          params: {
            email: payload.Email,
            password: payload.Password,
            organizationId: payload.OrganizationId,
          },
        },
      );
      return mapAuthResponse(unwrapApiResponse(response.data));
    } catch (error: unknown) {
      lastError = error;

      if (!axios.isAxiosError(error) || error.response?.status !== 404) {
        throw error;
      }
    }
  }

  throw lastError ?? new Error("Login endpoint not found.");
}

export async function registerOrganization(
  payload: RegisterOrganizationRequest,
): Promise<AuthResponse> {
  const backendPayload: BackendRegisterOrganizationRequest = {
    organizationName: payload.OrganizationName,
    email: payload.Email,
    password: payload.Password,
    adminEmail: payload.Email,
    adminPassword: payload.Password,
  };

  const registerEndpoints = [
    "/api/auth/register-organization",
    "/api/Auth/register-organization",
    "/api/auth/register",
    "/api/organizations",
  ];
  let lastError: unknown;
  const notFoundEndpoints: string[] = [];

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

      notFoundEndpoints.push(endpoint);
    }
  }

  if (notFoundEndpoints.length === registerEndpoints.length) {
    throw new Error(
      `Registration endpoint returned 404 for all known routes (${registerEndpoints.join(", ")}). Check BACKEND_API_URL and backend route mapping.`,
    );
  }

  throw lastError ?? new Error("Registration endpoint not found.");
}
