"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Event } from "@/types/event";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { submitEventAction, closeRegistrationAction } from "@/app/actions/eventActions";
import { Plus, Eye, Edit3, Users, Send, XCircle, AlertTriangle, Loader2 } from "lucide-react";

export function OrganizerEventsClient({ events }: { events: Event[] }) {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleSubmitForApproval = async (eventId: string) => {
    if (!confirm("Are you sure you want to submit this event for Admin approval?")) return;

    setLoadingId(eventId);
    try {
      const res = await submitEventAction(eventId);
      if (!res.success) {
        showError(res.error || "Failed to submit event");
      } else {
        showSuccess("Event submitted for admin approval!");
        router.refresh();
      }
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoadingId(null);
    }
  };

  const handleCloseRegistration = async (eventId: string) => {
    if (!confirm("Are you sure you want to manually close registration for this event?")) return;

    setLoadingId(eventId);
    try {
      const res = await closeRegistrationAction(eventId);
      if (!res.success) {
        showError(res.error || "Failed to close registration");
      } else {
        showSuccess("Registration closed for this event.");
        router.refresh();
      }
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your Events</h1>
          <p className="text-sm text-muted-foreground">
            Manage your created events, track approval statuses, and review registrations.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/organizer/events/create" className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>

      {events.length === 0 ? (
        <EmptyState
          title="No events created yet"
          description="You haven't created any events. Click below to start organizing an event."
          actionLabel="Create Event"
          actionHref="/organizer/events/create"
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Event Date</TableHead>
                  <TableHead>Registrations</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => {
                  const regCount = event.registrationCount || 0;
                  const isLoading = loadingId === event.id;

                  return (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">
                        <div>
                          <p className="font-semibold text-foreground line-clamp-1">{event.title}</p>
                          <p className="text-xs text-muted-foreground">{event.category}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge
                            variant={
                              event.status === "approved"
                                ? "success"
                                : event.status === "pending"
                                ? "warning"
                                : event.status === "rejected"
                                ? "destructive"
                                : "secondary"
                            }
                            className="capitalize"
                          >
                            {event.status}
                          </Badge>
                          {event.status === "rejected" && event.rejectionReason && (
                            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium max-w-xs">
                              Reason: {event.rejectionReason}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap">
                        {new Date(event.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-xs font-semibold whitespace-nowrap">
                        {regCount} / {event.maxParticipants}
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap">
                        {new Date(event.registrationDeadline).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {event.status === "draft" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSubmitForApproval(event.id)}
                              disabled={isLoading}
                            >
                              {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Send className="h-3.5 w-3.5 mr-1 text-amber-600" />}
                              Submit
                            </Button>
                          )}

                          {event.status === "approved" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-rose-600 border-rose-200 hover:bg-rose-50"
                              onClick={() => handleCloseRegistration(event.id)}
                              disabled={isLoading}
                            >
                              {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <XCircle className="h-3.5 w-3.5 mr-1" />}
                              Close Reg
                            </Button>
                          )}

                          <Button asChild size="sm" variant="outline">
                            <Link href={`/organizer/events/${event.id}/registrations`} title="View Registrations">
                              <Users className="h-3.5 w-3.5 mr-1" />
                              Registrations
                            </Link>
                          </Button>

                          <Button asChild size="sm" variant="ghost">
                            <Link href={`/organizer/events/${event.id}/edit`} title="Edit Event">
                              <Edit3 className="h-3.5 w-3.5" />
                            </Link>
                          </Button>

                          <Button asChild size="sm" variant="ghost">
                            <Link href={`/events/${event.id}`} title="View Public Page">
                              <Eye className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
