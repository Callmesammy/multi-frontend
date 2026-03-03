export type UserRole = "Admin" | "Member";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}
