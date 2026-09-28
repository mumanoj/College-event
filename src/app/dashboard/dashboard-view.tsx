"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Registration } from "@/types/registration";
import { User } from "@/types/user";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { cancelRegistrationAction } from "@/app/actions/registrationActions";
import { Calendar, Clock, MapPin, Ticket, AlertCircle, CheckCircle2, XCircle, ArrowRight, Loader2 } from "lucide-react";

interface DashboardViewProps {
  user: User;
  registrations: Registration[];
}

export function DashboardView({ user, registrations }: DashboardViewProps) {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const now = new Date();

  const upcomingRegistrations = registrations.filter((r) => {
    if (!r.event) return false;
    return new Date(r.event.date) >= now && r.status === "registered";
  });

  const pastRegistrations = registrations.filter((r) => {
    if (!r.event) return false;
    return new Date(r.event.date) < now && r.status === "registered";
  });

  const handleCancel = async (eventId: string) => {
    if (!confirm("Are you sure you want to unregister from this event?")) return;

    setCancellingId(eventId);
    try {
      const res = await cancelRegistrationAction(eventId);
      if (!res.success) {
        showError(res.error || "Failed to cancel registration");
      } else {
        showSuccess("Registration cancelled successfully.");
        router.refresh();
      }
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border bg-card p-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Welcome, {user.name}!</h1>
            <Badge variant="outline" className="capitalize">
              {user.role}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage your registered events and view your participation history.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/events" className="flex items-center gap-1.5">
            Discover More Events
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Upcoming Registrations</CardDescription>
            <CardTitle className="text-3xl font-bold text-primary">
              {upcomingRegistrations.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Attended / Past Events</CardDescription>
            <CardTitle className="text-3xl font-bold">{pastRegistrations.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Registered</CardDescription>
            <CardTitle className="text-3xl font-bold">{registrations.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upcoming">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="upcoming">Upcoming ({upcomingRegistrations.length})</TabsTrigger>
          <TabsTrigger value="past">Past Events ({pastRegistrations.length})</TabsTrigger>
          <TabsTrigger value="history">History ({registrations.length})</TabsTrigger>
        </TabsList>

        {/* Upcoming Tab */}
        <TabsContent value="upcoming">
          {upcomingRegistrations.length === 0 ? (
            <EmptyState
              title="No upcoming event registrations"
              description="You haven't registered for any upcoming events yet."
              actionLabel="Browse Events"
              actionHref="/events"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingRegistrations.map((reg) => {
                const event = reg.event;
                if (!event) return null;

                const isDeadlinePassed = new Date(event.registrationDeadline) < now;

                return (
                  <Card key={reg.id} className="flex flex-col justify-between">
                    <CardHeader className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <Badge variant="secondary">{event.category}</Badge>
                        <Badge variant="success">Confirmed</Badge>
                      </div>
                      <CardTitle className="text-lg font-bold">
                        <Link href={`/events/${event.id}`} className="hover:text-primary transition-colors">
                          {event.title}
                        </Link>
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">By {event.organizerName}</p>
                    </CardHeader>

                    <CardContent className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary shrink-0" />
                        <span>
                          {new Date(event.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary shrink-0" />
                        <span>{event.startTime} - {event.endTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary shrink-0" />
                        <span className="line-clamp-1">{event.venue}</span>
                      </div>
                    </CardContent>

                    <div className="flex items-center justify-between border-t p-4 text-xs">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/events/${event.id}`}>View Details</Link>
                      </Button>
                      {!isDeadlinePassed && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-rose-600 hover:bg-rose-50"
                          onClick={() => handleCancel(event.id)}
                          disabled={cancellingId === event.id}
                        >
                          {cancellingId === event.id && (
                            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                          )}
                          Cancel Registration
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Past Tab */}
        <TabsContent value="past">
          {pastRegistrations.length === 0 ? (
            <EmptyState
              title="No past events"
              description="You have no completed or past event registrations."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pastRegistrations.map((reg) => {
                const event = reg.event;
                if (!event) return null;
                return (
                  <Card key={reg.id} className="opacity-90">
                    <CardHeader className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <Badge variant="outline">{event.category}</Badge>
                        <Badge variant="secondary">Completed</Badge>
                      </div>
                      <CardTitle className="text-lg font-bold">{event.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span>{event.venue}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          {registrations.length === 0 ? (
            <EmptyState
              title="No registration history"
              description="You haven't registered for any events yet."
            />
          ) : (
            <div className="rounded-xl border bg-card overflow-hidden">
              <div className="divide-y text-sm">
                {registrations.map((reg) => (
                  <div
                    key={reg.id}
                    className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 hover:bg-muted/30"
                  >
                    <div>
                      <p className="font-semibold text-foreground">
                        {reg.event?.title || "Event #" + reg.eventId}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Registered on {new Date(reg.registeredAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          reg.status === "registered"
                            ? "success"
                            : reg.status === "cancelled"
                            ? "destructive"
                            : "secondary"
                        }
                        className="capitalize"
                      >
                        {reg.status}
                      </Badge>
                      {reg.event && (
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/events/${reg.event.id}`}>View</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
