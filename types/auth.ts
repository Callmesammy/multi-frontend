import type { Organization } from "@/types/organization";
import type { User } from "@/types/user";

export interface LoginRequest {
  email: string;
  password: string;
  organizationId: string;
}

export interface RegisterOrganizationRequest {
  organizationName: string;
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  organization: Organization;
}
