import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { registrationService } from "@/lib/services/registration.service";
import { DashboardView } from "./dashboard-view";

export const revalidate = 0;

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const registrations = await registrationService.getStudentRegistrations(user.id);

  return (
    <div className="container mx-auto py-8 px-4 sm:px-8">
      <DashboardView
        user={JSON.parse(JSON.stringify(user))}
        registrations={JSON.parse(JSON.stringify(registrations))}
      />
    </div>
  );
}
