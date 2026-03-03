import type {
  AuthResponse,
  LoginRequest,
  RegisterOrganizationRequest,
} from "@/types/auth";

import { client } from "@/lib/api/client";

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  const response = await client.post<AuthResponse>("/api/auth/login", payload);
  return response.data;
}

export async function registerOrganization(
  payload: RegisterOrganizationRequest,
): Promise<AuthResponse> {
  const response = await client.post<AuthResponse>("/api/organizations", payload);
  return response.data;
}
