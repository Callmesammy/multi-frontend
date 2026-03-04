import type { Organization } from "@/types/organization";
import type { User } from "@/types/user";

export interface LoginRequest {
  Email: string;
  Password: string;
  OrganizationId: string;
}

export interface RegisterOrganizationRequest {
  OrganizationName: string;
  Name: string;
  Email: string;
  Password: string;
}

export interface AuthResponse {
  Token: string;
  User: User;
  Organization: Organization;
}
