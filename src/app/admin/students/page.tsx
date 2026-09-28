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
import { ArrowLeft, GraduationCap, Mail, Calendar } from "lucide-react";

export const revalidate = 0;

export default async function AdminStudentsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== ROLES.ADMIN) {
    redirect("/dashboard");
  }

  const students = await userService.getStudents();

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
            <GraduationCap className="h-6 w-6 text-indigo-600" />
            Registered Students ({students.length})
          </h1>
          <p className="text-sm text-muted-foreground">
            Directory of registered college students and their participation activity.
          </p>
        </div>
      </div>

      {students.length === 0 ? (
        <EmptyState
          title="No students registered"
          description="There are currently no registered students in the system."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Email Address</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Event Registrations</TableHead>
                  <TableHead>Joined Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-semibold text-foreground">{student.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <a href={`mailto:${student.email}`} className="hover:underline flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                        {student.email}
                      </a>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {student.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-semibold">
                      <Badge variant="secondary">{student.registrationCount} Registered</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(student.createdAt).toLocaleDateString()}
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
