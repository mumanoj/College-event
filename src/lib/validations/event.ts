import { z } from "zod";

export const customQuestionSchema = z.object({
  id: z.string(),
  questionText: z.string().min(1, "Question text is required"),
  type: z.enum([
    "short_text",
    "long_text",
    "single_choice",
    "multiple_choice",
    "boolean",
  ]),
  required: z.boolean(),
  options: z.array(z.string()).optional(),
});

export const createEventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  category: z.string().min(1, "Category is required"),
  posterUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
  date: z.coerce.date(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  venue: z.string().min(1, "Venue is required"),
  venueDetails: z.string().optional(),
  registrationDeadline: z.coerce.date(),
  maxParticipants: z.number().int().positive("Maximum participants must be greater than 0"),
  eligibility: z.string().optional(),
  prerequisites: z.string().optional(),
  rules: z.array(z.string()).optional(),
  agenda: z.string().optional(),
  contactEmail: z.string().email("Invalid contact email address").optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  customQuestions: z.array(customQuestionSchema).optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
