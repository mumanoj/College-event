import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { clientPromise } from "@/lib/db";

const dbName = process.env.MONGODB_DB_NAME || "Cluster0";

// Await clientPromise to obtain the actual native MongoDB Db instance for Better Auth
const client = await clientPromise;
const db = client.db(dbName);

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    transaction: false,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "student",
        required: false,
      },
    },
  },
});
