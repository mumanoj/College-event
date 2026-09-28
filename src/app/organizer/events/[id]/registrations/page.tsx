import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { registrationService } from "@/lib/services/registration.service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ArrowLeft, Users, Mail, ShieldAlert } from "lucide-react";

export const revalidate = 0;

interface RegistrationsPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventRegistrationsPage({ params }: RegistrationsPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  try {
    const { event, registrations } = await registrationService.getEventRegistrations(
      id,
      user.id,
      user.role
    );

    return (
      <div className="container mx-auto py-8 px-4 sm:px-8 space-y-6 max-w-6xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Button variant="ghost" size="sm" asChild className="mb-1">
              <Link href="/organizer/events" className="flex items-center gap-1.5">
                <ArrowLeft className="h-4 w-4" />
                Back to Events
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">
              Registrations: {event.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              Total Registrations: {registrations.length} / {event.maxParticipants} max capacity
            </p>
          </div>

          <Badge variant="outline" className="text-sm py-1 px-3">
            {event.category}
          </Badge>
        </div>

        {registrations.length === 0 ? (
          <EmptyState
            title="No registrations yet"
            description="No students have registered for this event yet."
          />
        ) : (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Registered Students</CardTitle>
              <CardDescription>
                Detailed list of students and their responses to custom questions.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Registered Date</TableHead>
                    <TableHead>Status</TableHead>
                    {event.customQuestions && event.customQuestions.length > 0 && (
                      <TableHead>Custom Question Responses</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.map((reg) => (
                    <TableRow key={reg.id}>
                      <TableCell className="font-semibold text-foreground">{reg.studentName}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <a href={`mailto:${reg.studentEmail}`} className="hover:underline flex items-center gap-1">
                          <Mail className="h-3 w-3 text-primary shrink-0" />
                          {reg.studentEmail}
                        </a>
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                        {new Date(reg.registeredAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="success" className="capitalize">
                          {reg.status}
                        </Badge>
                      </TableCell>
                      {event.customQuestions && event.customQuestions.length > 0 && (
                        <TableCell className="text-xs">
                          <div className="space-y-1">
                            {reg.responses.map((resp, idx) => (
                              <div key={idx} className="bg-muted/50 p-2 rounded">
                                <span className="font-semibold text-foreground block">
                                  {resp.questionText}:
                                </span>
                                <span className="text-muted-foreground">
                                  {Array.isArray(resp.answer)
                                    ? resp.answer.join(", ")
                                    : String(resp.answer)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unauthorized access";
    return (
      <div className="container mx-auto py-16 px-4 max-w-md text-center">
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-8 text-rose-900 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-100 space-y-4">
          <ShieldAlert className="h-12 w-12 text-rose-600 mx-auto" />
          <h2 className="text-xl font-bold">Access Denied</h2>
          <p className="text-sm opacity-90">{errorMsg}</p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href="/organizer/events">Return to Your Events</Link>
          </Button>
        </div>
      </div>
    );
  }
}
