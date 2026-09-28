import { auth } from "@/lib/auth/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { ensureAdminCreated } from "@/lib/auth/admin-init";

const handlers = toNextJsHandler(auth.handler);

export async function GET(request: Request) {
  await ensureAdminCreated();
  return handlers.GET(request);
}

export async function POST(request: Request) {
  await ensureAdminCreated();
  return handlers.POST(request);
}
