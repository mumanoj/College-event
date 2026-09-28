"use client";

import Link from "next/link";
import { AdminAnalyticsData } from "@/lib/services/admin.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart3, PieChart, Users, CheckCircle2, XCircle, Clock, Calendar } from "lucide-react";

export function AnalyticsView({ analytics }: { analytics: AdminAnalyticsData }) {
  const {
    eventsByCategory,
    eventsByStatus,
    topEventsByRegistrations,
    totalStudents,
    totalOrganizers,
    totalRegistrations,
  } = analytics;

  const totalEventsCount = eventsByStatus.reduce((acc, curr) => acc + curr.count, 0);

  const approvedCount = eventsByStatus.find((s) => s.status === "approved")?.count || 0;
  const pendingCount = eventsByStatus.find((s) => s.status === "pending")?.count || 0;
  const rejectedCount = eventsByStatus.find((s) => s.status === "rejected")?.count || 0;
  const draftCount = eventsByStatus.find((s) => s.status === "draft")?.count || 0;

  const maxCategoryCount = Math.max(...eventsByCategory.map((c) => c.count), 1);
  const maxRegCount = Math.max(...topEventsByRegistrations.map((e) => e.registrations), 1);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2">
          <Link href="/admin" className="flex items-center gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Back to Admin Panel
          </Link>
        </Button>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-purple-600" />
              Real Database Event & Participation Analytics
            </h1>
            <p className="text-sm text-muted-foreground">
              Live college-wide analytics computed directly from MongoDB database aggregations.
            </p>
          </div>
          <Badge variant="outline" className="text-xs py-1 px-3">
            Real-time Aggregations
          </Badge>
        </div>
      </div>

      {/* Top Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-indigo-50/50 to-background dark:from-indigo-950/20">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5 font-semibold text-indigo-700 dark:text-indigo-400">
              <Users className="h-4 w-4" />
              Total Participating Students
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold">{totalStudents}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50/50 to-background dark:from-purple-950/20">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5 font-semibold text-purple-700 dark:text-purple-400">
              <Calendar className="h-4 w-4" />
              Total Events Created
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold">{totalEventsCount}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50/50 to-background dark:from-emerald-950/20">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              Total Registrations Recorded
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold">{totalRegistrations}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Events by Category Bar Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Events Breakdown by Category
            </CardTitle>
            <CardDescription>
              Distribution of college events across technical, cultural, and sports categories.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {eventsByCategory.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No category data available.</p>
            ) : (
              eventsByCategory.map((item) => {
                const percentage = Math.round((item.count / maxCategoryCount) * 100);
                return (
                  <div key={item.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span>{item.category}</span>
                      <span className="text-muted-foreground">{item.count} Events</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Approval Ratios & Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-amber-500" />
              Admin Approval Ratios & Statuses
            </CardTitle>
            <CardDescription>
              Overview of events approved, pending review, rejected, or saved in draft.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border bg-emerald-50/40 dark:bg-emerald-950/20 text-center space-y-1">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 mx-auto" />
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{approvedCount}</p>
                <p className="text-xs font-medium text-muted-foreground">Approved Events</p>
              </div>

              <div className="p-4 rounded-xl border bg-amber-50/40 dark:bg-amber-950/20 text-center space-y-1">
                <Clock className="h-6 w-6 text-amber-600 mx-auto" />
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{pendingCount}</p>
                <p className="text-xs font-medium text-muted-foreground">Pending Approval</p>
              </div>

              <div className="p-4 rounded-xl border bg-rose-50/40 dark:bg-rose-950/20 text-center space-y-1">
                <XCircle className="h-6 w-6 text-rose-600 mx-auto" />
                <p className="text-2xl font-bold text-rose-700 dark:text-rose-400">{rejectedCount}</p>
                <p className="text-xs font-medium text-muted-foreground">Rejected Events</p>
              </div>

              <div className="p-4 rounded-xl border bg-slate-50/40 dark:bg-slate-900/20 text-center space-y-1">
                <Calendar className="h-6 w-6 text-slate-500 mx-auto" />
                <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">{draftCount}</p>
                <p className="text-xs font-medium text-muted-foreground">Draft Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Events by Student Registrations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top 10 Most Popular Events by Registration</CardTitle>
          <CardDescription>
            College events attracting the highest number of student participants.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {topEventsByRegistrations.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No student registrations recorded yet.</p>
          ) : (
            topEventsByRegistrations.map((item, idx) => {
              const percentage = Math.min(
                100,
                Math.round((item.registrations / (item.capacity || 1)) * 100)
              );

              return (
                <div key={idx} className="space-y-1.5 border-b pb-3 last:border-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-medium gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-muted-foreground w-5">#{idx + 1}</span>
                      <span className="font-semibold text-foreground">{item.title}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {item.category}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground">
                      <strong className="text-foreground">{item.registrations}</strong> / {item.capacity} Spots ({percentage}% full)
                    </div>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
