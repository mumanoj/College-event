import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { eventService } from "@/lib/services/event.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Clock, CheckCircle2, FileEdit, Users, ArrowRight, LayoutDashboard } from "lucide-react";
import { ROLES } from "@/lib/permissions";

export const revalidate = 0;

export default async function OrganizerDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== ROLES.ORGANIZER && user.role !== ROLES.ADMIN) {
    redirect("/dashboard");
  }

  const events = await eventService.getEventsByOrganizer(user.id);

  const totalEvents = events.length;
  const draftEvents = events.filter((e) => e.status === "draft").length;
  const pendingEvents = events.filter((e) => e.status === "pending").length;
  const approvedEvents = events.filter((e) => e.status === "approved").length;
  const totalRegistrations = events.reduce((sum, e) => sum + (e.registrationCount || 0), 0);

  return (
    <div className="container mx-auto py-8 px-4 sm:px-8 space-y-8 max-w-7xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border bg-card p-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Organizer Dashboard</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage your college events, track approval statuses, and review student registrations.
          </p>
        </div>
        <Button asChild size="default" className="shadow-sm">
          <Link href="/organizer/events/create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create New Event
          </Link>
        </Button>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Events</CardDescription>
            <CardTitle className="text-3xl font-bold">{totalEvents}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Drafts</CardDescription>
            <CardTitle className="text-3xl font-bold text-slate-600">{draftEvents}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Approval</CardDescription>
            <CardTitle className="text-3xl font-bold text-amber-600">{pendingEvents}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Approved</CardDescription>
            <CardTitle className="text-3xl font-bold text-emerald-600">{approvedEvents}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="col-span-2 md:col-span-1">
          <CardHeader className="pb-2">
            <CardDescription>Total Registrations</CardDescription>
            <CardTitle className="text-3xl font-bold text-primary">{totalRegistrations}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Quick Actions & Recent Events */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Your Recent Events</h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/organizer/events" className="flex items-center gap-1.5">
              View All Events
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {events.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center bg-muted/20 space-y-3">
            <Calendar className="h-10 w-10 text-muted-foreground mx-auto" />
            <h3 className="font-semibold text-lg">No events created yet</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Start by creating your first college event. You can save as draft or submit directly for admin approval.
            </p>
            <Button asChild size="sm">
              <Link href="/organizer/events/create">Create Event Now</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.slice(0, 6).map((event) => (
              <Card key={event.id} className="flex flex-col justify-between">
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{event.category}</Badge>
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
                  </div>
                  <CardTitle className="text-lg font-bold line-clamp-1">{event.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{event.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="font-semibold text-foreground">
                      {event.registrationCount || 0} / {event.maxParticipants} Registered
                    </span>
                  </div>
                  {event.rejectionReason && (
                    <div className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-200 text-xs">
                      <strong>Rejection Reason:</strong> {event.rejectionReason}
                    </div>
                  )}
                </CardContent>

                <div className="flex items-center justify-between border-t p-4 text-xs gap-2">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/organizer/events/${event.id}/registrations`}>Registrations</Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/events/${event.id}`}>View</Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
