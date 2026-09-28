import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { eventService } from "@/lib/services/event.service";
import { AdminEventsClient } from "./admin-events-client";
import { ROLES } from "@/lib/permissions";

export const revalidate = 0;

export default async function AdminAllEventsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== ROLES.ADMIN) {
    redirect("/dashboard");
  }

  const events = await eventService.getAllEvents();

  return (
    <div className="container mx-auto py-8 px-4 sm:px-8">
      <AdminEventsClient initialEvents={JSON.parse(JSON.stringify(events))} />
    </div>
  );
}
