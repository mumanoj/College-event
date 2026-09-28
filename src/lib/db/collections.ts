import { Collection } from "mongodb";
import { getDb } from "./index";
import { User } from "@/types/user";
import { Event } from "@/types/event";
import { Registration } from "@/types/registration";

export const COLLECTIONS = {
  USERS: "user", // Better Auth uses 'user' collection by default
  EVENTS: "events",
  REGISTRATIONS: "registrations",
  SESSIONS: "session",
  ACCOUNTS: "account",
  VERIFICATIONS: "verification",
} as const;

let indexesCreated = false;

export async function ensureIndexes(): Promise<void> {
  if (indexesCreated) return;
  try {
    const db = await getDb();
    
    // Registrations collection indexes
    const regCol = db.collection(COLLECTIONS.REGISTRATIONS);
    await regCol.createIndex({ eventId: 1, studentId: 1 }, { unique: true });
    await regCol.createIndex({ studentId: 1 });
    await regCol.createIndex({ eventId: 1 });

    // Events collection indexes
    const eventCol = db.collection(COLLECTIONS.EVENTS);
    await eventCol.createIndex({ status: 1 });
    await eventCol.createIndex({ organizerId: 1 });
    await eventCol.createIndex({ category: 1 });
    await eventCol.createIndex({ date: 1 });
    await eventCol.createIndex({ registrationDeadline: 1 });

    // Users collection indexes
    const userCol = db.collection(COLLECTIONS.USERS);
    await userCol.createIndex({ email: 1 });
    await userCol.createIndex({ role: 1 });

    indexesCreated = true;
  } catch (error) {
    console.error("Error creating database indexes:", error);
  }
}

export async function getUsersCollection(): Promise<Collection<User>> {
  const db = await getDb();
  await ensureIndexes();
  return db.collection<User>(COLLECTIONS.USERS);
}

export async function getEventsCollection(): Promise<Collection<Event>> {
  const db = await getDb();
  await ensureIndexes();
  return db.collection<Event>(COLLECTIONS.EVENTS);
}

export async function getRegistrationsCollection(): Promise<Collection<Registration>> {
  const db = await getDb();
  await ensureIndexes();
  return db.collection<Registration>(COLLECTIONS.REGISTRATIONS);
}
