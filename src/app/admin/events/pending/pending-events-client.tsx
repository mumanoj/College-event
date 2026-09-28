"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Event } from "@/types/event";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { approveEventAction, rejectEventAction } from "@/app/actions/eventActions";
import { CheckCircle2, XCircle, Calendar, Clock, MapPin, Users, ArrowLeft, Loader2, Eye } from "lucide-react";

export function PendingEventsClient({ events }: { events: Event[] }) {
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  const [rejectingEvent, setRejectingEvent] = useState<Event | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleApprove = async (eventId: string) => {
    if (!confirm("Are you sure you want to approve this event? It will become publicly visible to students.")) return;

    setLoadingId(eventId);
    try {
      const res = await approveEventAction(eventId);
      if (!res.success) {
        showError(res.error || "Failed to approve event");
      } else {
        showSuccess("Event approved successfully!");
        router.refresh();
      }
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoadingId(null);
    }
  };

  const handleRejectConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingEvent) return;
    if (!rejectionReason.trim()) {
      showError("Please provide a rejection reason.");
      return;
    }

    setLoadingId(rejectingEvent.id);
    try {
      const res = await rejectEventAction(rejectingEvent.id, rejectionReason.trim());
      if (!res.success) {
        showError(res.error || "Failed to reject event");
      } else {
        showSuccess("Event rejected and organizer notified of reason.");
        setRejectingEvent(null);
        setRejectionReason("");
        router.refresh();
      }
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-1">
            <Link href="/admin" className="flex items-center gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Back to Admin Panel
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            Pending Event Approvals
            {events.length > 0 && (
              <Badge variant="warning">{events.length} Pending</Badge>
            )}
          </h1>
          <p className="text-sm text-muted-foreground">
            Review event details submitted by organizers before approving them for student discovery.
          </p>
        </div>
      </div>

      {events.length === 0 ? (
        <EmptyState
          title="No pending approvals"
          description="All event submissions have been reviewed. Check back when organizers submit new events."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event) => {
            const isLoading = loadingId === event.id;

            return (
              <Card key={event.id} className="flex flex-col justify-between border-amber-200/60 shadow-sm">
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{event.category}</Badge>
                    <Badge variant="warning" className="capitalize">
                      Pending Review
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-bold">{event.title}</CardTitle>
                  <CardDescription className="text-xs">
                    Submitted by: <strong className="text-foreground">{event.organizerName}</strong> ({event.contactEmail})
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 text-sm flex-1">
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {event.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-2 border-t">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{event.startTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="line-clamp-1">{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>Max {event.maxParticipants} participants</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="border-t p-4 flex items-center justify-between gap-2">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/events/${event.id}`}>
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      Full Preview
                    </Link>
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-rose-600 border-rose-200 hover:bg-rose-50"
                      onClick={() => {
                        setRejectingEvent(event);
                        setRejectionReason("");
                      }}
                      disabled={isLoading}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => handleApprove(event.id)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                      )}
                      Approve
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Reject Modal Dialog requiring Reason */}
      <Dialog open={!!rejectingEvent} onOpenChange={(open) => !open && setRejectingEvent(null)}>
        <DialogHeader>
          <DialogTitle>Reject Event: {rejectingEvent?.title}</DialogTitle>
          <DialogDescription>
            Please state why this event is being rejected. The organizer will be able to see this feedback.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleRejectConfirm} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="reason">
              Rejection Reason <span className="text-rose-500">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="e.g. Venue scheduling conflict / Insufficient details provided in rules..."
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRejectingEvent(null)}
              disabled={!!loadingId}
            >
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={!!loadingId}>
              {loadingId ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting Event...
                </>
              ) : (
                "Confirm Rejection"
              )}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
