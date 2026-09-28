import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { User, UserRole } from "@/types/user";
import { ROLES } from "@/lib/permissions";
import { getUsersCollection } from "@/lib/db/collections";
import { ensureAdminCreated } from "./admin-init";

export async function getCurrentSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session;
  } catch (error) {
    console.error("Error fetching session:", error);
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  await ensureAdminCreated();

  const session = await getCurrentSession();
  if (!session || !session.user) return null;

  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  const userEmail = session.user.email.toLowerCase();

  // Determine user role
  let role: UserRole = ((session.user as Record<string, unknown>).role as UserRole) || "student";

  // Check if email matches environment ADMIN_EMAIL
  if (adminEmail && userEmail === adminEmail && role !== ROLES.ADMIN) {
    role = ROLES.ADMIN;
    // Sync admin role in DB
    try {
      const usersCol = await getUsersCollection();
      await usersCol.updateOne({ email: userEmail }, { $set: { role: ROLES.ADMIN } });
    } catch (e) {
      console.error("Failed to sync admin role:", e);
    }
  }

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    emailVerified: session.user.emailVerified,
    image: session.user.image,
    role,
    createdAt: session.user.createdAt ? new Date(session.user.createdAt) : new Date(),
    updatedAt: session.user.updatedAt ? new Date(session.user.updatedAt) : new Date(),
  };
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized: Authentication required");
  }
  return user;
}

export async function requireRole(allowedRoles: UserRole[]): Promise<User> {
  const user = await requireAuth();

  // Admin always passes role checks
  if (user.role === ROLES.ADMIN) {
    return user;
  }

  if (!allowedRoles.includes(user.role)) {
    throw new Error(`Forbidden: Required one of roles [${allowedRoles.join(", ")}]`);
  }
  return user;
}

export async function requireAdmin(): Promise<User> {
  return requireRole([ROLES.ADMIN]);
}

export async function requireOrganizer(): Promise<User> {
  return requireRole([ROLES.ORGANIZER, ROLES.ADMIN]);
}

export async function requireStudent(): Promise<User> {
  return requireRole([ROLES.STUDENT, ROLES.ADMIN]);
}
