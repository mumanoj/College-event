import { Event } from "./event";

export type RegistrationStatus = "registered" | "cancelled" | "attended";

export interface QuestionResponse {
  questionId: string;
  questionText: string;
  answer: string | string[] | boolean;
}

export interface Registration {
  _id?: string;
  id: string;
  eventId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  status: RegistrationStatus;
  responses: QuestionResponse[];
  registeredAt: Date;
  updatedAt: Date;
  // Computed reference for display
  event?: Event;
}
