import { BaseService } from "./base.service";
import { getUsersCollection, getEventsCollection, getRegistrationsCollection } from "@/lib/db/collections";
import { User, UserRole } from "@/types/user";
import { Event } from "@/types/event";

export class UserService extends BaseService {
  async findByEmail(email: string): Promise<User | null> {
    try {
      const users = await getUsersCollection();
      return await users.findOne({ email: email.toLowerCase() });
    } catch (error) {
      this.handleError(error, "UserService.findByEmail");
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      const users = await getUsersCollection();
      return await users.findOne({ id });
    } catch (error) {
      this.handleError(error, "UserService.findById");
    }
  }

  async updateUserRole(userId: string, role: UserRole): Promise<boolean> {
    try {
      const users = await getUsersCollection();
      const result = await users.updateOne(
        { id: userId },
        {
          $set: {
            role,
            updatedAt: new Date(),
          },
        }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      this.handleError(error, "UserService.updateUserRole");
    }
  }

  /**
   * Get all registered students with registration count
   */
  async getStudents(): Promise<(User & { registrationCount: number })[]> {
    try {
      const usersCol = await getUsersCollection();
      const regCol = await getRegistrationsCollection();

      const students = await usersCol
        .find({ role: "student" })
        .sort({ createdAt: -1 })
        .toArray();

      if (students.length === 0) return [];

      const studentIds = students.map((s) => s.id);
      const regCounts = await regCol
        .aggregate([
          { $match: { studentId: { $in: studentIds }, status: "registered" } },
          { $group: { _id: "$studentId", count: { $sum: 1 } } },
        ])
        .toArray();

      const countMap = new Map<string, number>();
      regCounts.forEach((rc) => countMap.set(rc._id, rc.count));

      return students.map((s) => ({
        ...s,
        registrationCount: countMap.get(s.id) || 0,
      }));
    } catch (error) {
      this.handleError(error, "UserService.getStudents");
    }
  }

  /**
   * Get all organizers with event counts and registration stats
   */
  async getOrganizers(): Promise<
    (User & {
      totalEvents: number;
      approvedEvents: number;
      pendingEvents: number;
      totalRegistrations: number;
    })[]
  > {
    try {
      const usersCol = await getUsersCollection();
      const eventsCol = await getEventsCollection();
      const regCol = await getRegistrationsCollection();

      const organizers = await usersCol
        .find({ role: "organizer" })
        .sort({ createdAt: -1 })
        .toArray();

      if (organizers.length === 0) return [];

      const orgIds = organizers.map((o) => o.id);
      const events = await eventsCol.find({ organizerId: { $in: orgIds } }).toArray();

      const eventMap = new Map<string, Event[]>();
      events.forEach((e) => {
        const list = eventMap.get(e.organizerId) || [];
        list.push(e);
        eventMap.set(e.organizerId, list);
      });

      const eventIds = events.map((e) => e.id);
      const regCounts = await regCol
        .aggregate([
          { $match: { eventId: { $in: eventIds }, status: "registered" } },
          { $group: { _id: "$eventId", count: { $sum: 1 } } },
        ])
        .toArray();

      const regCountMap = new Map<string, number>();
      regCounts.forEach((rc) => regCountMap.set(rc._id, rc.count));

      return organizers.map((org) => {
        const orgEvents = eventMap.get(org.id) || [];
        const approvedEvents = orgEvents.filter((e) => e.status === "approved").length;
        const pendingEvents = orgEvents.filter((e) => e.status === "pending").length;
        let totalRegistrations = 0;
        orgEvents.forEach((e) => {
          totalRegistrations += regCountMap.get(e.id) || 0;
        });

        return {
          ...org,
          totalEvents: orgEvents.length,
          approvedEvents,
          pendingEvents,
          totalRegistrations,
        };
      });
    } catch (error) {
      this.handleError(error, "UserService.getOrganizers");
    }
  }
}

export const userService = new UserService();
