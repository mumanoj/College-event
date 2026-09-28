import { BaseService } from "./base.service";
import { getRegistrationsCollection, getEventsCollection } from "@/lib/db/collections";
import { Registration, QuestionResponse } from "@/types/registration";
import { Event } from "@/types/event";
import { User } from "@/types/user";
import { ROLES } from "@/lib/permissions";
import crypto from "crypto";

export class RegistrationService extends BaseService {
  /**
   * Register a student for an event
   */
  async registerForEvent(
    eventId: string,
    student: User,
    responses: QuestionResponse[]
  ): Promise<Registration> {
    try {
      const eventsCol = await getEventsCollection();
      const regCol = await getRegistrationsCollection();

      // 1. Fetch event
      const event = await eventsCol.findOne({ id: eventId });
      if (!event) {
        throw new Error("Event not found");
      }

      // 2. Verify status
      if (event.status !== "approved") {
        throw new Error("Registration is only allowed for approved events");
      }

      // 3. Verify deadline
      const now = new Date();
      if (new Date(event.registrationDeadline) < now) {
        throw new Error("Registration deadline has passed");
      }

      // 4. Verify existing registration
      const existing = await regCol.findOne({
        eventId,
        studentId: student.id,
        status: { $ne: "cancelled" },
      });

      if (existing) {
        throw new Error("You are already registered for this event");
      }

      // 5. Verify capacity
      const currentCount = await regCol.countDocuments({
        eventId,
        status: "registered",
      });

      if (currentCount >= event.maxParticipants) {
        throw new Error("Event capacity has been reached");
      }

      // 6. Create registration
      const newRegistration: Registration = {
        id: crypto.randomUUID(),
        eventId,
        studentId: student.id,
        studentName: student.name,
        studentEmail: student.email,
        status: "registered",
        responses: responses || [],
        registeredAt: new Date(),
        updatedAt: new Date(),
      };

      try {
        await regCol.insertOne(newRegistration);
      } catch (err: unknown) {
        // Handle MongoDB unique index violation for duplicate registrations
        if (err && typeof err === "object" && "code" in err && err.code === 11000) {
          throw new Error("You are already registered for this event");
        }
        throw err;
      }

      return newRegistration;
    } catch (error) {
      this.handleError(error, "RegistrationService.registerForEvent");
    }
  }

  /**
   * Cancel a student's registration
   */
  async cancelRegistration(eventId: string, studentId: string): Promise<boolean> {
    try {
      const eventsCol = await getEventsCollection();
      const regCol = await getRegistrationsCollection();

      const event = await eventsCol.findOne({ id: eventId });
      if (event && new Date(event.registrationDeadline) < new Date()) {
        throw new Error("Cannot cancel registration after the deadline has passed");
      }

      const result = await regCol.updateOne(
        { eventId, studentId, status: "registered" },
        {
          $set: {
            status: "cancelled",
            updatedAt: new Date(),
          },
        }
      );

      return result.modifiedCount > 0;
    } catch (error) {
      this.handleError(error, "RegistrationService.cancelRegistration");
    }
  }

  /**
   * Get all registrations for a specific student, enriched with event details
   */
  async getStudentRegistrations(studentId: string): Promise<Registration[]> {
    try {
      const regCol = await getRegistrationsCollection();
      const eventsCol = await getEventsCollection();

      const registrations = await regCol
        .find({ studentId, status: { $ne: "cancelled" } })
        .sort({ registeredAt: -1 })
        .toArray();

      if (registrations.length === 0) return [];

      const eventIds = Array.from(new Set(registrations.map((r) => r.eventId)));
      const events = await eventsCol.find({ id: { $in: eventIds } }).toArray();
      const eventMap = new Map<string, Event>();
      events.forEach((e) => eventMap.set(e.id, e));

      return registrations.map((r) => ({
        ...r,
        event: eventMap.get(r.eventId),
      }));
    } catch (error) {
      this.handleError(error, "RegistrationService.getStudentRegistrations");
    }
  }

  /**
   * Get registrations for an event (Secured: Organizer must own event or be Admin)
   */
  async getEventRegistrations(
    eventId: string,
    requesterId: string,
    requesterRole: string
  ): Promise<{ event: Event; registrations: Registration[] }> {
    try {
      const eventsCol = await getEventsCollection();
      const regCol = await getRegistrationsCollection();

      const event = await eventsCol.findOne({ id: eventId });
      if (!event) {
        throw new Error("Event not found");
      }

      // Security enforcement: Organizer can only view registrations for their own events!
      if (requesterRole !== ROLES.ADMIN && event.organizerId !== requesterId) {
        throw new Error("Forbidden: You do not have permission to view registrations for this event");
      }

      const registrations = await regCol
        .find({ eventId, status: "registered" })
        .sort({ registeredAt: -1 })
        .toArray();

      return { event, registrations };
    } catch (error) {
      this.handleError(error, "RegistrationService.getEventRegistrations");
    }
  }

  /**
   * Check if student is registered for event
   */
  async isStudentRegistered(eventId: string, studentId: string): Promise<boolean> {
    try {
      const regCol = await getRegistrationsCollection();
      const count = await regCol.countDocuments({
        eventId,
        studentId,
        status: "registered",
      });
      return count > 0;
    } catch (error) {
      this.handleError(error, "RegistrationService.isStudentRegistered");
    }
  }

  /**
   * Get registration count for an event
   */
  async getRegistrationCount(eventId: string): Promise<number> {
    try {
      const regCol = await getRegistrationsCollection();
      return await regCol.countDocuments({ eventId, status: "registered" });
    } catch (error) {
      this.handleError(error, "RegistrationService.getRegistrationCount");
    }
  }

  /**
   * Get map of registration counts for multiple event IDs
   */
  async getRegistrationCountsForEvents(eventIds: string[]): Promise<Record<string, number>> {
    try {
      if (eventIds.length === 0) return {};
      const regCol = await getRegistrationsCollection();
      const pipeline = [
        { $match: { eventId: { $in: eventIds }, status: "registered" } },
        { $group: { _id: "$eventId", count: { $sum: 1 } } },
      ];
      const results = await regCol.aggregate(pipeline).toArray();
      const map: Record<string, number> = {};
      results.forEach((row) => {
        map[row._id] = row.count;
      });
      return map;
    } catch (error) {
      this.handleError(error, "RegistrationService.getRegistrationCountsForEvents");
    }
  }
}

export const registrationService = new RegistrationService();
