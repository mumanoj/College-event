import { notFound } from "next/navigation";
import { eventService } from "@/lib/services/event.service";
import { getCurrentUser } from "@/lib/auth/session";
import { registrationService } from "@/lib/services/registration.service";
import { EventDetailClient } from "./event-detail-client";

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;
  const event = await eventService.getEventById(id);

  if (!event) {
    notFound();
  }

  const currentUser = await getCurrentUser();
  let isRegistered = false;

  if (currentUser) {
    isRegistered = await registrationService.isStudentRegistered(id, currentUser.id);
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-8">
      <EventDetailClient
        event={JSON.parse(JSON.stringify(event))}
        currentUser={currentUser ? JSON.parse(JSON.stringify(currentUser)) : null}
        isRegistered={isRegistered}
      />
    </div>
  );
}
