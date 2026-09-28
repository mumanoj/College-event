import { BaseService } from "./base.service";
import { getUsersCollection, getEventsCollection, getRegistrationsCollection } from "@/lib/db/collections";

export interface AdminDashboardStats {
  totalStudents: number;
  totalOrganizers: number;
  totalEvents: number;
  pendingApprovals: number;
  approvedEvents: number;
  totalRegistrations: number;
}

export interface CategoryStat {
  category: string;
  count: number;
}

export interface StatusStat {
  status: string;
  count: number;
}

export interface EventRegistrationStat {
  title: string;
  category: string;
  registrations: number;
  capacity: number;
}

export interface AdminAnalyticsData {
  eventsByCategory: CategoryStat[];
  eventsByStatus: StatusStat[];
  topEventsByRegistrations: EventRegistrationStat[];
  totalStudents: number;
  totalOrganizers: number;
  totalRegistrations: number;
}

export class AdminService extends BaseService {
  async getDashboardStats(): Promise<AdminDashboardStats> {
    try {
      const usersCol = await getUsersCollection();
      const eventsCol = await getEventsCollection();
      const regCol = await getRegistrationsCollection();

      const [
        totalStudents,
        totalOrganizers,
        totalEvents,
        pendingApprovals,
        approvedEvents,
        totalRegistrations,
      ] = await Promise.all([
        usersCol.countDocuments({ role: "student" }),
        usersCol.countDocuments({ role: "organizer" }),
        eventsCol.countDocuments({}),
        eventsCol.countDocuments({ status: "pending" }),
        eventsCol.countDocuments({ status: "approved" }),
        regCol.countDocuments({ status: "registered" }),
      ]);

      return {
        totalStudents,
        totalOrganizers,
        totalEvents,
        pendingApprovals,
        approvedEvents,
        totalRegistrations,
      };
    } catch (error) {
      this.handleError(error, "AdminService.getDashboardStats");
    }
  }

  async getAnalyticsData(): Promise<AdminAnalyticsData> {
    try {
      const eventsCol = await getEventsCollection();
      const usersCol = await getUsersCollection();
      const regCol = await getRegistrationsCollection();

      const [categoryRes, statusRes, topRegRes, totalStudents, totalOrganizers, totalRegistrations] =
        await Promise.all([
          eventsCol
            .aggregate<{ _id: string; count: number }>([
              { $group: { _id: "$category", count: { $sum: 1 } } },
              { $sort: { count: -1 } },
            ])
            .toArray(),
          eventsCol
            .aggregate<{ _id: string; count: number }>([
              { $group: { _id: "$status", count: { $sum: 1 } } },
            ])
            .toArray(),
          regCol
            .aggregate<{ _id: string; count: number }>([
              { $match: { status: "registered" } },
              { $group: { _id: "$eventId", count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 10 },
            ])
            .toArray(),
          usersCol.countDocuments({ role: "student" }),
          usersCol.countDocuments({ role: "organizer" }),
          regCol.countDocuments({ status: "registered" }),
        ]);

      const eventsByCategory: CategoryStat[] = categoryRes.map((r) => ({
        category: r._id || "Uncategorized",
        count: r.count,
      }));

      const eventsByStatus: StatusStat[] = statusRes.map((r) => ({
        status: r._id,
        count: r.count,
      }));

      const topEventIds = topRegRes.map((r) => r._id);
      const topEvents = await eventsCol.find({ id: { $in: topEventIds } }).toArray();
      const eventMap = new Map<string, (typeof topEvents)[0]>();
      topEvents.forEach((e) => eventMap.set(e.id, e));

      const topEventsByRegistrations: EventRegistrationStat[] = topRegRes.map((r) => {
        const ev = eventMap.get(r._id);
        return {
          title: ev?.title || "Unknown Event",
          category: ev?.category || "General",
          registrations: r.count,
          capacity: ev?.maxParticipants || 0,
        };
      });

      return {
        eventsByCategory,
        eventsByStatus,
        topEventsByRegistrations,
        totalStudents,
        totalOrganizers,
        totalRegistrations,
      };
    } catch (error) {
      this.handleError(error, "AdminService.getAnalyticsData");
    }
  }
}

export const adminService = new AdminService();
