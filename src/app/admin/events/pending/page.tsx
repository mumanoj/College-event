import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { eventService } from "@/lib/services/event.service";
import { PendingEventsClient } from "./pending-events-client";
import { ROLES } from "@/lib/permissions";

export const revalidate = 0;

export default async function AdminPendingEventsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== ROLES.ADMIN) {
    redirect("/dashboard");
  }

  const pendingEvents = await eventService.getPendingEvents();

  return (
    <div className="container mx-auto py-8 px-4 sm:px-8">
      <PendingEventsClient events={JSON.parse(JSON.stringify(pendingEvents))} />
    </div>
  );
}
