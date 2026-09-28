import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { adminService } from "@/lib/services/admin.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ROLES } from "@/lib/permissions";
import {
  Shield,
  Clock,
  CheckCircle2,
  Users,
  GraduationCap,
  Calendar,
  BarChart3,
  ArrowRight,
} from "lucide-react";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== ROLES.ADMIN) {
    redirect("/dashboard");
  }

  const stats = await adminService.getDashboardStats();

  return (
    <div className="container mx-auto py-8 px-4 sm:px-8 space-y-8 max-w-7xl">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border bg-card p-6 shadow-sm border-l-4 border-l-primary">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">College Admin Panel</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage college-wide events, review pending organizer submissions, monitor students & organizers, and inspect analytics.
          </p>
        </div>
        {stats.pendingApprovals > 0 && (
          <Button asChild size="default" className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm">
            <Link href="/admin/events/pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {stats.pendingApprovals} Pending Approval{stats.pendingApprovals > 1 ? "s" : ""}
            </Link>
          </Button>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Students</CardDescription>
            <CardTitle className="text-3xl font-bold">{stats.totalStudents}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Organizers</CardDescription>
            <CardTitle className="text-3xl font-bold">{stats.totalOrganizers}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Events</CardDescription>
            <CardTitle className="text-3xl font-bold">{stats.totalEvents}</CardTitle>
          </CardHeader>
        </Card>
        <Card className={stats.pendingApprovals > 0 ? "border-amber-300 bg-amber-50/30 dark:bg-amber-950/20" : ""}>
          <CardHeader className="pb-2">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-3xl font-bold text-amber-600">{stats.pendingApprovals}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Approved</CardDescription>
            <CardTitle className="text-3xl font-bold text-emerald-600">{stats.approvedEvents}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Registrations</CardDescription>
            <CardTitle className="text-3xl font-bold text-primary">{stats.totalRegistrations}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Navigation Quick Links Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Admin Management Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <Clock className="h-6 w-6 text-amber-600" />
                {stats.pendingApprovals > 0 && (
                  <Badge variant="warning">{stats.pendingApprovals} Action Required</Badge>
                )}
              </div>
              <CardTitle className="text-lg">Pending Event Approvals</CardTitle>
              <CardDescription>
                Review submitted events from organizers, approve for public visibility, or reject with a reason.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/admin/events/pending" className="flex items-center justify-between">
                  <span>Review Pending Events</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="space-y-2">
              <Calendar className="h-6 w-6 text-primary" />
              <CardTitle className="text-lg">All Events Directory</CardTitle>
              <CardDescription>
                Browse, search, and filter all college events across all statuses (Approved, Draft, Pending, Rejected, Closed).
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/admin/events" className="flex items-center justify-between">
                  <span>Manage All Events</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="space-y-2">
              <GraduationCap className="h-6 w-6 text-indigo-600" />
              <CardTitle className="text-lg">Students Directory</CardTitle>
              <CardDescription>
                View all registered college students, their registration counts, and account creation timestamps.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/admin/students" className="flex items-center justify-between">
                  <span>View Students ({stats.totalStudents})</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="space-y-2">
              <Users className="h-6 w-6 text-emerald-600" />
              <CardTitle className="text-lg">Organizers Directory</CardTitle>
              <CardDescription>
                Monitor event organizers, review their event creation activity, approval ratios, and total registrations.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/admin/organizers" className="flex items-center justify-between">
                  <span>View Organizers ({stats.totalOrganizers})</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-2">
            <CardHeader className="space-y-2">
              <BarChart3 className="h-6 w-6 text-purple-600" />
              <CardTitle className="text-lg">College Event Analytics</CardTitle>
              <CardDescription>
                Real database aggregation charts showing event categories, approval distributions, participation metrics, and top events.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                <Link href="/admin/analytics" className="flex items-center gap-2">
                  <span>View Full Analytics Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
