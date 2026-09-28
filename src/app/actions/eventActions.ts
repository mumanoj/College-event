"use server";

import { requireOrganizer, requireAdmin, requireAuth } from "@/lib/auth/session";
import { eventService } from "@/lib/services/event.service";
import { createEventSchema } from "@/lib/validations/event";
import { revalidatePath } from "next/cache";
import { z } from "zod";

function formatZodError(error: unknown, fallbackMessage: string): string {
  if (error instanceof z.ZodError) {
    return error.issues.map((issue) => issue.message).join(". ");
  }
  return error instanceof Error ? error.message : fallbackMessage;
}

export async function createEventAction(formData: unknown, submitForApproval = false) {
  try {
    const user = await requireOrganizer();
    const validatedData = createEventSchema.parse(formData);

    const newEvent = await eventService.createEvent(validatedData, user, submitForApproval);
    revalidatePath("/events");
    revalidatePath("/organizer");
    revalidatePath("/organizer/events");
    revalidatePath("/admin");
    return { success: true, data: newEvent };
  } catch (error: unknown) {
    return {
      success: false,
      error: formatZodError(error, "Failed to create event"),
    };
  }
}

export async function updateEventAction(
  eventId: string,
  formData: unknown,
  submitForApproval = false
) {
  try {
    const user = await requireAuth();
    const validatedData = createEventSchema.partial().parse(formData);

    const updatedEvent = await eventService.updateEvent(
      eventId,
      validatedData,
      user.id,
      user.role,
      submitForApproval
    );

    revalidatePath(`/events/${eventId}`);
    revalidatePath("/events");
    revalidatePath("/organizer/events");
    revalidatePath("/admin/events");
    return { success: true, data: updatedEvent };
  } catch (error: unknown) {
    return {
      success: false,
      error: formatZodError(error, "Failed to update event"),
    };
  }
}

export async function submitEventAction(eventId: string) {
  try {
    const user = await requireOrganizer();
    const success = await eventService.submitEvent(eventId, user.id);
    revalidatePath("/organizer/events");
    revalidatePath("/admin/events/pending");
    return { success };
  } catch (error: unknown) {
    return {
      success: false,
      error: formatZodError(error, "Failed to submit event"),
    };
  }
}

export async function approveEventAction(eventId: string) {
  try {
    await requireAdmin();
    const success = await eventService.approveEvent(eventId);
    revalidatePath("/events");
    revalidatePath("/admin/events");
    revalidatePath("/admin/events/pending");
    revalidatePath("/organizer/events");
    return { success };
  } catch (error: unknown) {
    return {
      success: false,
      error: formatZodError(error, "Failed to approve event"),
    };
  }
}

export async function rejectEventAction(eventId: string, reason: string) {
  try {
    await requireAdmin();
    const success = await eventService.rejectEvent(eventId, reason);
    revalidatePath("/admin/events");
    revalidatePath("/admin/events/pending");
    revalidatePath("/organizer/events");
    return { success };
  } catch (error: unknown) {
    return {
      success: false,
      error: formatZodError(error, "Failed to reject event"),
    };
  }
}

export async function closeRegistrationAction(eventId: string) {
  try {
    const user = await requireAuth();
    const success = await eventService.closeRegistration(eventId, user.id, user.role);
    revalidatePath(`/events/${eventId}`);
    revalidatePath("/events");
    revalidatePath("/organizer/events");
    return { success };
  } catch (error: unknown) {
    return {
      success: false,
      error: formatZodError(error, "Failed to close registration"),
    };
  }
}
