"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Event } from "@/types/event";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Search, ArrowLeft, Eye, Users } from "lucide-react";

const STATUSES = ["all", "approved", "pending", "draft", "rejected", "closed"];

export function AdminEventsClient({ initialEvents }: { initialEvents: Event[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredEvents = useMemo(() => {
    return initialEvents.filter((event) => {
      if (statusFilter !== "all" && event.status !== statusFilter) return false;
      if (search.trim() !== "") {
        const query = search.toLowerCase();
        const matchTitle = event.title.toLowerCase().includes(query);
        const matchCat = event.category.toLowerCase().includes(query);
        const matchOrg = event.organizerName.toLowerCase().includes(query);
        return matchTitle || matchCat || matchOrg;
      }
      return true;
    });
  }, [initialEvents, search, statusFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-1">
            <Link href="/admin" className="flex items-center gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Back to Admin Panel
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">All College Events ({initialEvents.length})</h1>
          <p className="text-sm text-muted-foreground">
            College-wide event directory across all statuses.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 rounded-xl border bg-card p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events by title, organizer, or category..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-xs font-semibold text-muted-foreground">Status:</span>
          <select
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium capitalize"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {STATUSES.map((st) => (
              <option key={st} value={st}>
                {st === "all" ? "All Statuses" : st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <EmptyState
          title="No events found"
          description="No events match your current search or status filter."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title & Category</TableHead>
                  <TableHead>Organizer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Registrations</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div>
                        <p className="font-semibold text-foreground line-clamp-1">{event.title}</p>
                        <Badge variant="outline" className="text-xs mt-0.5">
                          {event.category}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-medium">{event.organizerName}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          event.status === "approved"
                            ? "success"
                            : event.status === "pending"
                            ? "warning"
                            : event.status === "rejected"
                            ? "destructive"
                            : "secondary"
                        }
                        className="capitalize text-xs"
                      >
                        {event.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap">
                      {new Date(event.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-xs font-semibold whitespace-nowrap">
                      {event.registrationCount || 0} / {event.maxParticipants}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button asChild size="sm" variant="ghost">
                          <Link href={`/events/${event.id}`}>
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            View
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
