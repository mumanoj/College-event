import { eventService } from "@/lib/services/event.service";
import { EventCatalogView } from "./event-catalog-view";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await eventService.getPublishedEvents();

  return (
    <div className="container mx-auto py-8 px-4 sm:px-8 max-w-7xl">
      <EventCatalogView initialEvents={JSON.parse(JSON.stringify(events))} />
    </div>
  );
}
