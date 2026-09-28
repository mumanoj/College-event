import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { eventService } from "@/lib/services/event.service";
import { EventForm } from "@/app/organizer/events/create/event-form";
import { ROLES } from "@/lib/permissions";

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEventPage({ params }: EditPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const event = await eventService.getEventById(id);
  if (!event) {
    notFound();
  }

  // Security check: organizer can only edit own event unless admin
  if (user.role !== ROLES.ADMIN && event.organizerId !== user.id) {
    redirect("/organizer/events");
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-8">
      <EventForm initialEvent={JSON.parse(JSON.stringify(event))} isEdit />
    </div>
  );
}
