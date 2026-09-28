import { auth } from "@/lib/auth/auth";
import { getUsersCollection } from "@/lib/db/collections";

let adminInitialized = false;

export async function ensureAdminCreated(): Promise<void> {
  if (adminInitialized) return;

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();

  if (!adminEmail || !adminPassword) return;

  try {
    const usersCol = await getUsersCollection();
    const existing = await usersCol.findOne({ email: adminEmail });

    if (existing) {
      if (existing.role !== "admin") {
        await usersCol.updateOne({ email: adminEmail }, { $set: { role: "admin" } });
      }
      adminInitialized = true;
      return;
    }

    // Auto-create Admin user credentials in Better Auth
    console.log(`[Admin Init]: Seeding Admin user account for ${adminEmail}...`);
    try {
      await auth.api.signUpEmail({
        body: {
          email: adminEmail,
          password: adminPassword,
          name: "System Admin",
          role: "admin",
        },
      });

      // Ensure role is explicitly "admin"
      await usersCol.updateOne({ email: adminEmail }, { $set: { role: "admin" } });
      console.log(`[Admin Init]: Admin account ${adminEmail} seeded successfully!`);
    } catch (err) {
      console.warn("[Admin Init]: Sign up attempt message:", err);
    }

    adminInitialized = true;
  } catch (error) {
    console.error("[Admin Init Error]:", error);
  }
}
