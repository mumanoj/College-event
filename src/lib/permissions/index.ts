import { UserRole } from "@/types/user";

export const ROLES = {
  STUDENT: "student" as UserRole,
  ORGANIZER: "organizer" as UserRole,
  ADMIN: "admin" as UserRole,
} as const;

export function hasRole(userRole: UserRole | undefined, targetRole: UserRole): boolean {
  if (!userRole) return false;
  if (userRole === ROLES.ADMIN) return true; // Admin has all permissions
  return userRole === targetRole;
}

export function assertRole(userRole: UserRole | undefined, targetRole: UserRole): void {
  if (!hasRole(userRole, targetRole)) {
    throw new Error(`Forbidden: Required role ${targetRole}`);
  }
}

export function canCreateEvents(userRole: UserRole | undefined): boolean {
  return userRole === ROLES.ORGANIZER || userRole === ROLES.ADMIN;
}

export function canApproveEvents(userRole: UserRole | undefined): boolean {
  return userRole === ROLES.ADMIN;
}

export function canManageEvent(
  userRole: UserRole | undefined,
  userId: string | undefined,
  eventOrganizerId: string
): boolean {
  if (!userRole || !userId) return false;
  if (userRole === ROLES.ADMIN) return true;
  if (userRole === ROLES.ORGANIZER && userId === eventOrganizerId) return true;
  return false;
}
