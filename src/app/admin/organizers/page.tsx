import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { userService } from "@/lib/services/user.service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ROLES } from "@/lib/permissions";
import { ArrowLeft, Users, Mail } from "lucide-react";

export const revalidate = 0;

export default async function AdminOrganizersPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== ROLES.ADMIN) {
    redirect("/dashboard");
  }

  const organizers = await userService.getOrganizers();

  return (
    <div className="container mx-auto py-8 px-4 sm:px-8 space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-1">
            <Link href="/admin" className="flex items-center gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Back to Admin Panel
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-emerald-600" />
            Event Organizers Directory ({organizers.length})
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitor event organizers, review event counts, approval statistics, and total student registrations.
          </p>
        </div>
      </div>

      {organizers.length === 0 ? (
        <EmptyState
          title="No organizers registered"
          description="There are currently no registered event organizers in the system."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organizer Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Total Events</TableHead>
                  <TableHead>Approved Events</TableHead>
                  <TableHead>Pending Events</TableHead>
                  <TableHead>Total Registrations</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organizers.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell className="font-semibold text-foreground">{org.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <a href={`mailto:${org.email}`} className="hover:underline flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                        {org.email}
                      </a>
                    </TableCell>
                    <TableCell className="text-xs font-semibold">{org.totalEvents}</TableCell>
                    <TableCell className="text-xs font-semibold text-emerald-600">
                      {org.approvedEvents}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-amber-600">
                      {org.pendingEvents}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-primary">
                      {org.totalRegistrations}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
