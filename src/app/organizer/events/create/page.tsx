import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { EventForm } from "./event-form";
import { ROLES } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function CreateEventPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== ROLES.ORGANIZER && user.role !== ROLES.ADMIN) {
    redirect("/dashboard");
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-8">
      <EventForm />
    </div>
  );
}
