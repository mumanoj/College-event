import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { eventService } from "@/lib/services/event.service";
import { OrganizerEventsClient } from "./organizer-events-client";
import { ROLES } from "@/lib/permissions";

export const revalidate = 0;

export default async function OrganizerEventsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== ROLES.ORGANIZER && user.role !== ROLES.ADMIN) {
    redirect("/dashboard");
  }

  const events = await eventService.getEventsByOrganizer(user.id);

  return (
    <div className="container mx-auto py-8 px-4 sm:px-8 max-w-7xl">
      <OrganizerEventsClient events={JSON.parse(JSON.stringify(events))} />
    </div>
  );
}
