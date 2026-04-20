export type UserRole = "Manager" | "Supervisor" | "Employee" | "Not Defined";

export interface RoleContextType {
  role: UserRole | null;
  isManager: boolean;
  isSupervisor: boolean;
  isEmployee: boolean;
  loading: boolean;
  error: string | null;
  refreshRole: () => Promise<void>;
}