import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { adminService } from "@/lib/services/admin.service";
import { AnalyticsView } from "./analytics-view";
import { ROLES } from "@/lib/permissions";

export const revalidate = 0;

export default async function AdminAnalyticsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== ROLES.ADMIN) {
    redirect("/dashboard");
  }

  const analytics = await adminService.getAnalyticsData();

  return (
    <div className="container mx-auto py-8 px-4 sm:px-8">
      <AnalyticsView analytics={JSON.parse(JSON.stringify(analytics))} />
    </div>
  );
}
