import { MongoClient, Db } from "mongodb";
import dns from "dns";

const rawUri = process.env.MONGODB_URI || "mongodb://localhost:27017/college_event_db";
const dbName = process.env.MONGODB_DB_NAME || "Cluster0";

const options = {
  connectTimeoutMS: 15000,
  serverSelectionTimeoutMS: 15000,
};

async function resolveMongoUri(inputUri: string): Promise<string> {
  if (!inputUri.startsWith("mongodb+srv://")) {
    return inputUri;
  }

  try {
    const match = inputUri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/(.*)/);
    if (!match) return inputUri;

    const [, user, pass, hostname, rest] = match;
    const srvTarget = `_mongodb._tcp.${hostname}`;

    // Use custom public Google & Cloudflare DNS resolver to bypass local ISP/router SRV blocks
    const resolver = new dns.promises.Resolver();
    resolver.setServers(["8.8.8.8", "1.1.1.1"]);

    const addresses = await resolver.resolveSrv(srvTarget);
    if (addresses && addresses.length > 0) {
      const hosts = addresses.map((a) => `${a.name}:${a.port}`).join(",");
      const cleanRest = rest || "";
      const delimiter = cleanRest.includes("?") ? "&" : "?";
      const resolvedUri = `mongodb://${user}:${pass}@${hosts}/${cleanRest}${delimiter}ssl=true&authSource=admin`;
      return resolvedUri;
    }
  } catch (err) {
    console.warn("SRV resolution via Google DNS failed, using original URI:", err);
  }

  return inputUri;
}

let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

async function createConnectedClient(): Promise<MongoClient> {
  const finalUri = await resolveMongoUri(rawUri);
  const client = new MongoClient(finalUri, options);
  return await client.connect();
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = createConnectedClient();
  }
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = createConnectedClient();
}

export async function getDb(): Promise<Db> {
  const connectedClient = await clientPromise;
  return connectedClient.db(dbName);
}

export { clientPromise };
