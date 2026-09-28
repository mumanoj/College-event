"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Event, CustomQuestion } from "@/types/event";
import { User } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { registerForEventAction, cancelRegistrationAction } from "@/app/actions/registrationActions";
import { QuestionResponse } from "@/types/registration";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  FileText,
  ListOrdered,
  HelpCircle,
  Loader2,
  Share2,
} from "lucide-react";

interface EventDetailClientProps {
  event: Event;
  currentUser: User | null;
  isRegistered: boolean;
}

export function EventDetailClient({
  event,
  currentUser,
  isRegistered: initialRegistered,
}: EventDetailClientProps) {
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  const [isRegistering, setIsRegistering] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Form state for custom questions
  const [answers, setAnswers] = useState<Record<string, string | string[] | boolean>>({});

  const count = event.registrationCount || 0;
  const max = event.maxParticipants;
  const isFull = count >= max;
  const isDeadlinePassed = new Date(event.registrationDeadline) < new Date();
  const isOpen = event.status === "approved" && !isFull && !isDeadlinePassed;

  const handleAnswerChange = (questionId: string, value: string | string[] | boolean) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleCheckboxOption = (questionId: string, option: string, checked: boolean) => {
    const current = (answers[questionId] as string[]) || [];
    if (checked) {
      setAnswers((prev) => ({ ...prev, [questionId]: [...current, option] }));
    } else {
      setAnswers((prev) => ({ ...prev, [questionId]: current.filter((o) => o !== option) }));
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      router.push("/login");
      return;
    }

    // Validate required custom questions
    if (event.customQuestions) {
      for (const q of event.customQuestions) {
        if (q.required) {
          const ans = answers[q.id];
          if (
            ans === undefined ||
            ans === "" ||
            (Array.isArray(ans) && ans.length === 0)
          ) {
            showError(`Please answer required question: "${q.questionText}"`);
            return;
          }
        }
      }
    }

    setIsSubmitting(true);
    try {
      const responses: QuestionResponse[] = (event.customQuestions || []).map((q) => ({
        questionId: q.id,
        questionText: q.questionText,
        answer: answers[q.id] !== undefined ? answers[q.id] : "",
      }));

      const res = await registerForEventAction(event.id, responses);
      if (!res.success) {
        showError(res.error || "Failed to register");
      } else {
        showSuccess("Registration successful! See you at the event.");
        setIsRegistering(false);
        router.refresh();
      }
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!confirm("Are you sure you want to cancel your registration for this event?")) return;

    setIsCancelling(true);
    try {
      const res = await cancelRegistrationAction(event.id);
      if (!res.success) {
        showError(res.error || "Failed to cancel registration");
      } else {
        showSuccess("Registration cancelled successfully.");
        router.refresh();
      }
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Navigation */}
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/events" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Event Catalog
          </Link>
        </Button>
      </div>

      {/* Event Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border bg-card shadow-lg">
        <div className="relative h-64 sm:h-80 w-full bg-slate-900 overflow-hidden flex items-center justify-center">
          {event.posterUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={event.posterUrl} alt={event.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-slate-400 text-center">
              <Calendar className="h-16 w-16 mb-2 opacity-40 text-indigo-400" />
              <span className="text-lg font-medium">{event.title}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-white/20 text-white backdrop-blur-md">
                  {event.category}
                </Badge>
                {isOpen ? (
                  <Badge variant="success">Registration Open</Badge>
                ) : isFull ? (
                  <Badge variant="warning">Event Full</Badge>
                ) : (
                  <Badge variant="destructive">Registration Closed</Badge>
                )}
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">{event.title}</h1>
              <p className="text-sm text-slate-300">Organized by {event.organizerName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Details vs Registration Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Details, Agenda, Rules, Prerequisites */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">About the Event</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none text-muted-foreground whitespace-pre-line leading-relaxed">
              {event.description}
            </CardContent>
          </Card>

          {event.agenda && (
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <ListOrdered className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl">Event Agenda</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground whitespace-pre-line leading-relaxed text-sm">
                {event.agenda}
              </CardContent>
            </Card>
          )}

          {(event.eligibility || event.prerequisites) && (
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl">Eligibility & Prerequisites</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {event.eligibility && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Eligibility</h4>
                    <p className="text-muted-foreground">{event.eligibility}</p>
                  </div>
                )}
                {event.prerequisites && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Prerequisites</h4>
                    <p className="text-muted-foreground">{event.prerequisites}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {event.rules && event.rules.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl">Rules & Guidelines</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1.5 text-sm text-muted-foreground">
                  {event.rules.map((rule, idx) => (
                    <li key={idx}>{rule}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right 1 Col: Quick Info & Registration Action Box */}
        <div className="space-y-6">
          <Card className="border-2 border-primary/20 shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Event Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Date</p>
                  <p className="text-muted-foreground">
                    {new Date(event.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Time</p>
                  <p className="text-muted-foreground">
                    {event.startTime} - {event.endTime}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Venue</p>
                  <p className="text-muted-foreground">{event.venue}</p>
                  {event.venueDetails && (
                    <p className="text-xs text-muted-foreground mt-0.5">{event.venueDetails}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Registration Capacity</p>
                  <p className="text-muted-foreground">
                    {count} / {max} Registered ({Math.max(0, max - count)} spots left)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Registration Deadline</p>
                  <p className="text-muted-foreground">
                    {new Date(event.registrationDeadline).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <p className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                  Contact Organizer
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 text-primary" />
                  <a href={`mailto:${event.contactEmail}`} className="hover:underline">
                    {event.contactEmail}
                  </a>
                </div>
                {event.contactPhone && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 text-primary" />
                    <span>{event.contactPhone}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2">
                {initialRegistered ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm font-semibold dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-200">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      You are Registered!
                    </div>
                    {!isDeadlinePassed && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-rose-600 border-rose-200 hover:bg-rose-50"
                        onClick={handleCancelRegistration}
                        disabled={isCancelling}
                      >
                        {isCancelling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Cancel Registration
                      </Button>
                    )}
                  </div>
                ) : !currentUser ? (
                  <Button asChild className="w-full h-11" size="lg">
                    <Link href="/login">Log in to Register</Link>
                  </Button>
                ) : isOpen ? (
                  <Button
                    className="w-full h-11 text-base font-semibold shadow-md"
                    size="lg"
                    onClick={() => setIsRegistering(true)}
                  >
                    Register Now
                  </Button>
                ) : isFull ? (
                  <Button disabled className="w-full h-11" variant="secondary">
                    Event Full
                  </Button>
                ) : (
                  <Button disabled className="w-full h-11" variant="secondary">
                    Registration Closed
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Registration Modal Dialog */}
      <Dialog open={isRegistering} onOpenChange={setIsRegistering}>
        <DialogHeader>
          <DialogTitle>Register for {event.title}</DialogTitle>
          <DialogDescription>
            Please fill out the details required by the organizer to complete registration.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleRegisterSubmit} className="space-y-4 py-2">
          <div className="space-y-1 p-3 rounded-lg bg-muted/40 text-xs">
            <p>
              <strong>Attendee:</strong> {currentUser?.name} ({currentUser?.email})
            </p>
          </div>

          {event.customQuestions && event.customQuestions.length > 0 ? (
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
              <h4 className="text-sm font-semibold border-b pb-2">Custom Questions</h4>
              {event.customQuestions.map((q) => (
                <div key={q.id} className="space-y-1.5">
                  <Label className="flex items-center gap-1">
                    <span>{q.questionText}</span>
                    {q.required && <span className="text-rose-500 font-bold">*</span>}
                  </Label>

                  {q.type === "short_text" && (
                    <Input
                      placeholder="Your answer..."
                      value={(answers[q.id] as string) || ""}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      required={q.required}
                    />
                  )}

                  {q.type === "long_text" && (
                    <Textarea
                      placeholder="Your detailed answer..."
                      value={(answers[q.id] as string) || ""}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      required={q.required}
                    />
                  )}

                  {q.type === "single_choice" && (
                    <div className="space-y-1.5 pt-1">
                      {q.options?.map((opt, idx) => (
                        <label key={idx} className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="radio"
                            name={`q_${q.id}`}
                            value={opt}
                            checked={answers[q.id] === opt}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            required={q.required}
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {q.type === "multiple_choice" && (
                    <div className="space-y-1.5 pt-1">
                      {q.options?.map((opt, idx) => {
                        const currentOpts = (answers[q.id] as string[]) || [];
                        return (
                          <label key={idx} className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                              type="checkbox"
                              value={opt}
                              checked={currentOpts.includes(opt)}
                              onChange={(e) =>
                                handleCheckboxOption(q.id, opt, e.target.checked)
                              }
                            />
                            <span>{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {q.type === "boolean" && (
                    <div className="flex gap-4 pt-1">
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="radio"
                          name={`q_${q.id}`}
                          value="Yes"
                          checked={answers[q.id] === true || answers[q.id] === "Yes"}
                          onChange={() => handleAnswerChange(q.id, true)}
                        />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="radio"
                          name={`q_${q.id}`}
                          value="No"
                          checked={answers[q.id] === false || answers[q.id] === "No"}
                          onChange={() => handleAnswerChange(q.id, false)}
                        />
                        <span>No</span>
                      </label>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-2">
              No additional registration questions required for this event.
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRegistering(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Confirming Registration...
                </>
              ) : (
                "Complete Registration"
              )}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
