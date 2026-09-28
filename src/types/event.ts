export type EventStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "closed"
  | "registration_closed"
  | "cancelled"
  | "completed";

export type QuestionType =
  | "short_text"
  | "long_text"
  | "single_choice"
  | "multiple_choice"
  | "boolean";

export interface CustomQuestion {
  id: string;
  questionText: string;
  type: QuestionType;
  required: boolean;
  options?: string[];
}

export interface Event {
  _id?: string;
  id: string;
  title: string;
  description: string;
  category: string;
  posterUrl?: string;
  date: Date;
  startTime: string;
  endTime: string;
  venue: string;
  venueDetails?: string;
  registrationDeadline: Date;
  maxParticipants: number;
  eligibility?: string;
  prerequisites?: string;
  rules?: string[];
  agenda?: string;
  organizerId: string;
  organizerName: string;
  contactEmail: string;
  contactPhone?: string;
  customQuestions?: CustomQuestion[];
  status: EventStatus;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
  // Computed fields when returned in views
  registrationCount?: number;
}
