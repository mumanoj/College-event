"use server";

import { requireStudent, requireAuth } from "@/lib/auth/session";
import { registrationService } from "@/lib/services/registration.service";
import { QuestionResponse } from "@/types/registration";
import { revalidatePath } from "next/cache";

export async function registerForEventAction(eventId: string, responses: QuestionResponse[]) {
  try {
    const student = await requireStudent();
    const registration = await registrationService.registerForEvent(eventId, student, responses);

    revalidatePath(`/events/${eventId}`);
    revalidatePath("/events");
    revalidatePath("/dashboard");
    revalidatePath("/organizer/events");
    return { success: true, data: registration };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to register for event",
    };
  }
}

export async function cancelRegistrationAction(eventId: string) {
  try {
    const user = await requireAuth();
    const success = await registrationService.cancelRegistration(eventId, user.id);

    revalidatePath(`/events/${eventId}`);
    revalidatePath("/events");
    revalidatePath("/dashboard");
    revalidatePath("/organizer/events");
    return { success };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to cancel registration",
    };
  }
}
