import { BaseService } from "./base.service";
import { getEventsCollection, getRegistrationsCollection } from "@/lib/db/collections";
import { Event, EventStatus } from "@/types/event";
import { User } from "@/types/user";
import { CreateEventInput } from "@/lib/validations/event";
import { ROLES } from "@/lib/permissions";
import crypto from "crypto";

function sanitizeEvent(doc: Record<string, unknown> | null | undefined): Event | null {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return {
    ...rest,
    _id: _id ? String(_id) : undefined,
  } as unknown as Event;
}

export class EventService extends BaseService {
  /**
   * Create a new event
   */
  async createEvent(
    input: CreateEventInput,
    organizer: User,
    submitForApproval = false
  ): Promise<Event> {
    try {
      const events = await getEventsCollection();
      const newEvent: Event = {
        id: crypto.randomUUID(),
        title: input.title,
        description: input.description,
        category: input.category,
        posterUrl: input.posterUrl || "",
        date: new Date(input.date),
        startTime: input.startTime,
        endTime: input.endTime,
        venue: input.venue,
        venueDetails: input.venueDetails || "",
        registrationDeadline: new Date(input.registrationDeadline),
        maxParticipants: Number(input.maxParticipants),
        eligibility: input.eligibility || "",
        prerequisites: input.prerequisites || "",
        rules: input.rules || [],
        agenda: input.agenda || "",
        organizerId: organizer.id,
        organizerName: organizer.name,
        contactEmail: input.contactEmail || organizer.email,
        contactPhone: input.contactPhone || "",
        customQuestions: input.customQuestions || [],
        status: submitForApproval ? "pending" : "draft",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await events.insertOne(newEvent);
      return sanitizeEvent(newEvent as unknown as Record<string, unknown>)!;
    } catch (error) {
      this.handleError(error, "EventService.createEvent");
    }
  }

  /**
   * Update an existing event
   */
  async updateEvent(
    eventId: string,
    input: Partial<CreateEventInput>,
    requesterId: string,
    requesterRole: string,
    submitForApproval = false
  ): Promise<Event | null> {
    try {
      const events = await getEventsCollection();
      const existing = await events.findOne({ id: eventId });

      if (!existing) {
        throw new Error("Event not found");
      }

      if (requesterRole !== ROLES.ADMIN && existing.organizerId !== requesterId) {
        throw new Error("Forbidden: You can only edit your own events");
      }

      const updateDoc: Partial<Event> = {
        updatedAt: new Date(),
      };

      if (input.title) updateDoc.title = input.title;
      if (input.description) updateDoc.description = input.description;
      if (input.category) updateDoc.category = input.category;
      if (input.posterUrl !== undefined) updateDoc.posterUrl = input.posterUrl;
      if (input.date) updateDoc.date = new Date(input.date);
      if (input.startTime) updateDoc.startTime = input.startTime;
      if (input.endTime) updateDoc.endTime = input.endTime;
      if (input.venue) updateDoc.venue = input.venue;
      if (input.venueDetails !== undefined) updateDoc.venueDetails = input.venueDetails;
      if (input.registrationDeadline)
        updateDoc.registrationDeadline = new Date(input.registrationDeadline);
      if (input.maxParticipants !== undefined)
        updateDoc.maxParticipants = Number(input.maxParticipants);
      if (input.eligibility !== undefined) updateDoc.eligibility = input.eligibility;
      if (input.prerequisites !== undefined) updateDoc.prerequisites = input.prerequisites;
      if (input.rules) updateDoc.rules = input.rules;
      if (input.agenda !== undefined) updateDoc.agenda = input.agenda;
      if (input.contactEmail) updateDoc.contactEmail = input.contactEmail;
      if (input.contactPhone !== undefined) updateDoc.contactPhone = input.contactPhone;
      if (input.customQuestions) updateDoc.customQuestions = input.customQuestions;

      if (submitForApproval) {
        updateDoc.status = "pending";
        updateDoc.rejectionReason = undefined;
      }

      await events.updateOne({ id: eventId }, { $set: updateDoc });
      const updated = await events.findOne({ id: eventId });
      return sanitizeEvent(updated as unknown as Record<string, unknown>);
    } catch (error) {
      this.handleError(error, "EventService.updateEvent");
    }
  }

  /**
   * Submit draft event for approval
   */
  async submitEvent(eventId: string, organizerId: string): Promise<boolean> {
    try {
      const events = await getEventsCollection();
      const existing = await events.findOne({ id: eventId });
      if (!existing) throw new Error("Event not found");

      if (existing.organizerId !== organizerId) {
        throw new Error("Forbidden: You can only submit your own events");
      }

      const result = await events.updateOne(
        { id: eventId },
        {
          $set: {
            status: "pending",
            rejectionReason: undefined,
            updatedAt: new Date(),
          },
        }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      this.handleError(error, "EventService.submitEvent");
    }
  }

  /**
   * Admin approves event
   */
  async approveEvent(eventId: string): Promise<boolean> {
    try {
      const events = await getEventsCollection();
      const result = await events.updateOne(
        { id: eventId },
        {
          $set: {
            status: "approved",
            rejectionReason: undefined,
            updatedAt: new Date(),
          },
        }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      this.handleError(error, "EventService.approveEvent");
    }
  }

  /**
   * Admin rejects event with reason
   */
  async rejectEvent(eventId: string, reason: string): Promise<boolean> {
    try {
      if (!reason || reason.trim().length === 0) {
        throw new Error("A rejection reason is required");
      }
      const events = await getEventsCollection();
      const result = await events.updateOne(
        { id: eventId },
        {
          $set: {
            status: "rejected",
            rejectionReason: reason,
            updatedAt: new Date(),
          },
        }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      this.handleError(error, "EventService.rejectEvent");
    }
  }

  /**
   * Organizer closes registration manually
   */
  async closeRegistration(
    eventId: string,
    requesterId: string,
    requesterRole: string
  ): Promise<boolean> {
    try {
      const events = await getEventsCollection();
      const existing = await events.findOne({ id: eventId });
      if (!existing) throw new Error("Event not found");

      if (requesterRole !== ROLES.ADMIN && existing.organizerId !== requesterId) {
        throw new Error("Forbidden: You can only close registration for your own events");
      }

      const result = await events.updateOne(
        { id: eventId },
        {
          $set: {
            status: "closed",
            updatedAt: new Date(),
          },
        }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      this.handleError(error, "EventService.closeRegistration");
    }
  }

  /**
   * Get public/approved events with search, filter, and sorting
   */
  async getPublishedEvents(params?: {
    category?: string;
    search?: string;
    sort?: string;
    availability?: string;
  }): Promise<Event[]> {
    try {
      const eventsCol = await getEventsCollection();
      const query: Record<string, unknown> = { status: "approved" };

      if (params?.category && params.category !== "all") {
        query.category = params.category;
      }

      if (params?.search && params.search.trim() !== "") {
        const regex = new RegExp(params.search.trim(), "i");
        query.$or = [
          { title: regex },
          { description: regex },
          { category: regex },
          { organizerName: regex },
          { venue: regex },
        ];
      }

      let sortOptions: Record<string, 1 | -1> = { date: 1 };
      if (params?.sort === "recently_added") {
        sortOptions = { createdAt: -1 };
      } else if (params?.sort === "deadline") {
        sortOptions = { registrationDeadline: 1 };
      }

      const rawEvents = await eventsCol.find(query).sort(sortOptions).toArray();
      if (rawEvents.length === 0) return [];

      const events = rawEvents
        .map((e) => sanitizeEvent(e as unknown as Record<string, unknown>))
        .filter(Boolean) as Event[];

      const regCol = await getRegistrationsCollection();
      const eventIds = events.map((e) => e.id);
      const regCounts = await regCol
        .aggregate([
          { $match: { eventId: { $in: eventIds }, status: "registered" } },
          { $group: { _id: "$eventId", count: { $sum: 1 } } },
        ])
        .toArray();

      const countMap = new Map<string, number>();
      regCounts.forEach((rc) => countMap.set(rc._id, rc.count));

      let result = events.map((e) => ({
        ...e,
        registrationCount: countMap.get(e.id) || 0,
      }));

      if (params?.availability === "open") {
        const now = new Date();
        result = result.filter(
          (e) =>
            new Date(e.registrationDeadline) > now &&
            (e.registrationCount || 0) < e.maxParticipants
        );
      }

      return result;
    } catch (error) {
      console.error("[EventService.getPublishedEvents error]:", error);
      return [];
    }
  }

  /**
   * Get single event by ID with registration count
   */
  async getEventById(id: string): Promise<Event | null> {
    try {
      const eventsCol = await getEventsCollection();
      const rawEvent = await eventsCol.findOne({ id });
      if (!rawEvent) return null;

      const event = sanitizeEvent(rawEvent as unknown as Record<string, unknown>);
      if (!event) return null;

      const regCol = await getRegistrationsCollection();
      const registrationCount = await regCol.countDocuments({
        eventId: id,
        status: "registered",
      });

      return {
        ...event,
        registrationCount,
      };
    } catch (error) {
      console.error("[EventService.getEventById error]:", error);
      return null;
    }
  }

  /**
   * Get events owned by an organizer
   */
  async getEventsByOrganizer(organizerId: string): Promise<Event[]> {
    try {
      const eventsCol = await getEventsCollection();
      const rawEvents = await eventsCol.find({ organizerId }).sort({ createdAt: -1 }).toArray();
      if (rawEvents.length === 0) return [];

      const events = rawEvents
        .map((e) => sanitizeEvent(e as unknown as Record<string, unknown>))
        .filter(Boolean) as Event[];

      const regCol = await getRegistrationsCollection();
      const eventIds = events.map((e) => e.id);
      const regCounts = await regCol
        .aggregate([
          { $match: { eventId: { $in: eventIds }, status: "registered" } },
          { $group: { _id: "$eventId", count: { $sum: 1 } } },
        ])
        .toArray();

      const countMap = new Map<string, number>();
      regCounts.forEach((rc) => countMap.set(rc._id, rc.count));

      return events.map((e) => ({
        ...e,
        registrationCount: countMap.get(e.id) || 0,
      }));
    } catch (error) {
      console.error("[EventService.getEventsByOrganizer error]:", error);
      return [];
    }
  }

  /**
   * Get pending events for Admin approval
   */
  async getPendingEvents(): Promise<Event[]> {
    try {
      const eventsCol = await getEventsCollection();
      const rawEvents = await eventsCol.find({ status: "pending" }).sort({ createdAt: 1 }).toArray();
      return rawEvents
        .map((e) => sanitizeEvent(e as unknown as Record<string, unknown>))
        .filter(Boolean) as Event[];
    } catch (error) {
      console.error("[EventService.getPendingEvents error]:", error);
      return [];
    }
  }

  /**
   * Get all events for Admin
   */
  async getAllEvents(params?: { status?: string; search?: string }): Promise<Event[]> {
    try {
      const eventsCol = await getEventsCollection();
      const query: Record<string, unknown> = {};

      if (params?.status && params.status !== "all") {
        query.status = params.status;
      }

      if (params?.search && params.search.trim() !== "") {
        const regex = new RegExp(params.search.trim(), "i");
        query.$or = [
          { title: regex },
          { category: regex },
          { organizerName: regex },
        ];
      }

      const rawEvents = await eventsCol.find(query).sort({ createdAt: -1 }).toArray();
      if (rawEvents.length === 0) return [];

      const events = rawEvents
        .map((e) => sanitizeEvent(e as unknown as Record<string, unknown>))
        .filter(Boolean) as Event[];

      const regCol = await getRegistrationsCollection();
      const eventIds = events.map((e) => e.id);
      const regCounts = await regCol
        .aggregate([
          { $match: { eventId: { $in: eventIds }, status: "registered" } },
          { $group: { _id: "$eventId", count: { $sum: 1 } } },
        ])
        .toArray();

      const countMap = new Map<string, number>();
      regCounts.forEach((rc) => countMap.set(rc._id, rc.count));

      return events.map((e) => ({
        ...e,
        registrationCount: countMap.get(e.id) || 0,
      }));
    } catch (error) {
      console.error("[EventService.getAllEvents error]:", error);
      return [];
    }
  }

  /**
   * Update arbitrary status
   */
  async updateEventStatus(
    eventId: string,
    status: EventStatus,
    rejectionReason?: string
  ): Promise<boolean> {
    try {
      const events = await getEventsCollection();
      const updateDoc: Partial<Event> = {
        status,
        updatedAt: new Date(),
      };
      if (rejectionReason !== undefined) {
        updateDoc.rejectionReason = rejectionReason;
      }
      const result = await events.updateOne({ id: eventId }, { $set: updateDoc });
      return result.modifiedCount > 0;
    } catch (error) {
      this.handleError(error, "EventService.updateEventStatus");
    }
  }
}

export const eventService = new EventService();
