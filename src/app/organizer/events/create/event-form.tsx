"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { createEventAction, updateEventAction } from "@/app/actions/eventActions";
import { Event, CustomQuestion, QuestionType } from "@/types/event";
import { Plus, Trash2, ArrowLeft, Send, Save, Loader2, HelpCircle } from "lucide-react";
import Link from "next/link";
import crypto from "crypto";

const CATEGORIES = [
  "Technical",
  "Cultural",
  "Sports",
  "Workshop",
  "Seminar",
  "Hackathon",
  "Management",
  "General",
];

interface EventFormProps {
  initialEvent?: Event;
  isEdit?: boolean;
}

export function EventForm({ initialEvent, isEdit = false }: EventFormProps) {
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  const [title, setTitle] = useState(initialEvent?.title || "");
  const [description, setDescription] = useState(initialEvent?.description || "");
  const [category, setCategory] = useState(initialEvent?.category || "Technical");
  const [posterUrl, setPosterUrl] = useState(initialEvent?.posterUrl || "");
  const [date, setDate] = useState(
    initialEvent?.date ? new Date(initialEvent.date).toISOString().split("T")[0] : ""
  );
  const [startTime, setStartTime] = useState(initialEvent?.startTime || "10:00 AM");
  const [endTime, setEndTime] = useState(initialEvent?.endTime || "04:00 PM");
  const [venue, setVenue] = useState(initialEvent?.venue || "");
  const [venueDetails, setVenueDetails] = useState(initialEvent?.venueDetails || "");
  const [registrationDeadline, setRegistrationDeadline] = useState(
    initialEvent?.registrationDeadline
      ? new Date(initialEvent.registrationDeadline).toISOString().slice(0, 16)
      : ""
  );
  const [maxParticipants, setMaxParticipants] = useState(initialEvent?.maxParticipants || 100);
  const [eligibility, setEligibility] = useState(initialEvent?.eligibility || "");
  const [prerequisites, setPrerequisites] = useState(initialEvent?.prerequisites || "");
  const [rules, setRules] = useState<string>(initialEvent?.rules?.join("\n") || "");
  const [agenda, setAgenda] = useState(initialEvent?.agenda || "");
  const [contactEmail, setContactEmail] = useState(initialEvent?.contactEmail || "");
  const [contactPhone, setContactPhone] = useState(initialEvent?.contactPhone || "");

  // Custom Questions state
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>(
    initialEvent?.customQuestions || []
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add Question helper
  const addQuestion = () => {
    const newQ: CustomQuestion = {
      id: Math.random().toString(36).substring(2, 9),
      questionText: "",
      type: "short_text",
      required: true,
      options: [],
    };
    setCustomQuestions((prev) => [...prev, newQ]);
  };

  const removeQuestion = (id: string) => {
    setCustomQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const updateQuestion = (id: string, updates: Partial<CustomQuestion>) => {
    setCustomQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  const handleOptionsChange = (id: string, rawText: string) => {
    const options = rawText.split("\n").map((s) => s.trim()).filter(Boolean);
    updateQuestion(id, { options });
  };

  const handleSubmit = async (submitForApproval: boolean) => {
    if (!title || !description || !venue || !date || !registrationDeadline) {
      showError("Please fill out all required basic fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title,
        description,
        category,
        posterUrl,
        date,
        startTime,
        endTime,
        venue,
        venueDetails,
        registrationDeadline,
        maxParticipants: Number(maxParticipants),
        eligibility,
        prerequisites,
        rules: rules.split("\n").map((r) => r.trim()).filter(Boolean),
        agenda,
        contactEmail,
        contactPhone,
        customQuestions,
      };

      let res;
      if (isEdit && initialEvent) {
        res = await updateEventAction(initialEvent.id, payload, submitForApproval);
      } else {
        res = await createEventAction(payload, submitForApproval);
      }

      if (!res.success) {
        showError(res.error || "Action failed");
      } else {
        showSuccess(
          submitForApproval
            ? "Event submitted for approval successfully!"
            : "Event saved as draft successfully!"
        );
        router.push("/organizer/events");
        router.refresh();
      }
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/organizer/events" className="flex items-center gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Back to Organizer Events
          </Link>
        </Button>
        <Badge variant={isEdit ? "secondary" : "default"}>
          {isEdit ? "Editing Event" : "Create New Event"}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {isEdit ? "Edit Event Details" : "Create a College Event"}
          </CardTitle>
          <CardDescription>
            Fill out the details below. You can save as a draft or submit directly to Admin for approval.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Basic Details</h3>

            <div className="space-y-2">
              <Label htmlFor="title">
                Event Title <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g. Annual Hackathon 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="posterUrl">Poster Image URL (Optional)</Label>
                <Input
                  id="posterUrl"
                  type="url"
                  placeholder="https://example.com/poster.jpg"
                  value={posterUrl}
                  onChange={(e) => setPosterUrl(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Event Description <span className="text-rose-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Provide a comprehensive description of the event..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Logistics & Schedule */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Schedule & Logistics</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">
                  Event Date <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="text"
                  placeholder="e.g. 10:00 AM"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="text"
                  placeholder="e.g. 05:00 PM"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="venue">
                  Venue / Location <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="venue"
                  placeholder="e.g. Main Auditorium, Block B"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="venueDetails">Specific Venue Instructions</Label>
                <Input
                  id="venueDetails"
                  placeholder="e.g. Enter via East Gate"
                  value={venueDetails}
                  onChange={(e) => setVenueDetails(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="registrationDeadline">
                  Registration Deadline <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="registrationDeadline"
                  type="datetime-local"
                  value={registrationDeadline}
                  onChange={(e) => setRegistrationDeadline(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxParticipants">
                  Maximum Capacity <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  min={1}
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(Number(e.target.value))}
                  required
                />
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Guidelines & Agenda</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eligibility">Eligibility Criteria</Label>
                <Input
                  id="eligibility"
                  placeholder="e.g. All CS and EC students"
                  value={eligibility}
                  onChange={(e) => setEligibility(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prerequisites">Prerequisites</Label>
                <Input
                  id="prerequisites"
                  placeholder="e.g. Laptop with Python 3.10+"
                  value={prerequisites}
                  onChange={(e) => setPrerequisites(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rules">Rules (One per line)</Label>
              <Textarea
                id="rules"
                placeholder="1. Bring College ID&#10;2. No late entry after 10:15 AM"
                rows={3}
                value={rules}
                onChange={(e) => setRules(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="agenda">Agenda / Timeline</Label>
              <Textarea
                id="agenda"
                placeholder="10:00 AM - Keynote&#10;11:30 AM - Coding Round 1"
                rows={3}
                value={agenda}
                onChange={(e) => setAgenda(e.target.value)}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Contact Details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="organizer@college.edu"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone (Optional)</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Custom Registration Questions Builder */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  Custom Registration Questions
                </h3>
                <p className="text-xs text-muted-foreground">
                  Collect custom information from students during event registration (e.g. Department, Year, Experience).
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                <Plus className="h-4 w-4 mr-1" />
                Add Question
              </Button>
            </div>

            {customQuestions.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-2">
                No custom questions added yet. Standard student profile details (name, email) will be automatically collected.
              </p>
            ) : (
              <div className="space-y-4">
                {customQuestions.map((q, idx) => (
                  <Card key={q.id} className="p-4 relative bg-muted/20 border-border">
                    <button
                      type="button"
                      onClick={() => removeQuestion(q.id)}
                      className="absolute top-3 right-3 text-muted-foreground hover:text-rose-600 transition-colors"
                      title="Delete question"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2 space-y-1">
                          <Label className="text-xs">Question #{idx + 1}</Label>
                          <Input
                            placeholder="e.g. What is your Department & Semester?"
                            value={q.questionText}
                            onChange={(e) =>
                              updateQuestion(q.id, { questionText: e.target.value })
                            }
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">Input Type</Label>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={q.type}
                            onChange={(e) =>
                              updateQuestion(q.id, {
                                type: e.target.value as QuestionType,
                              })
                            }
                          >
                            <option value="short_text">Short Text</option>
                            <option value="long_text">Long Text</option>
                            <option value="single_choice">Single Choice (Radio)</option>
                            <option value="multiple_choice">Multiple Choice (Checkboxes)</option>
                            <option value="boolean">Yes / No</option>
                          </select>
                        </div>
                      </div>

                      {(q.type === "single_choice" || q.type === "multiple_choice") && (
                        <div className="space-y-1">
                          <Label className="text-xs">Options (One option per line)</Label>
                          <Textarea
                            placeholder="Option 1&#10;Option 2&#10;Option 3"
                            rows={2}
                            value={q.options?.join("\n") || ""}
                            onChange={(e) => handleOptionsChange(q.id, e.target.value)}
                          />
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id={`req_${q.id}`}
                          checked={q.required}
                          onChange={(e) =>
                            updateQuestion(q.id, { required: e.target.checked })
                          }
                          className="rounded border-input"
                        />
                        <Label htmlFor={`req_${q.id}`} className="text-xs cursor-pointer">
                          Required question
                        </Label>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 border-t pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Save className="h-4 w-4 mr-1.5" />
              )}
              Save as Draft
            </Button>
            <Button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Send className="h-4 w-4 mr-1.5" />
              )}
              Submit for Approval
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
