"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Event } from "@/types/event";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Search, Calendar, MapPin, Users, Clock, Filter, ArrowUpDown, Sparkles } from "lucide-react";

const CATEGORIES = [
  "All",
  "Technical",
  "Cultural",
  "Sports",
  "Workshop",
  "Seminar",
  "Hackathon",
  "Management",
];

export function EventCatalogView({ initialEvents }: { initialEvents: Event[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState<"upcoming" | "recent" | "deadline">("upcoming");
  const [availability, setAvailability] = useState<"all" | "open">("all");

  const filteredEvents = useMemo(() => {
    return initialEvents
      .filter((event) => {
        // Category filter
        if (category !== "All" && event.category.toLowerCase() !== category.toLowerCase()) {
          return false;
        }
        // Availability filter
        if (availability === "open") {
          const isDeadlinePassed = new Date(event.registrationDeadline) < new Date();
          const isFull = (event.registrationCount || 0) >= event.maxParticipants;
          if (isDeadlinePassed || isFull) return false;
        }
        // Search filter
        if (search.trim() !== "") {
          const query = search.toLowerCase();
          const matchTitle = event.title.toLowerCase().includes(query);
          const matchDesc = event.description.toLowerCase().includes(query);
          const matchCat = event.category.toLowerCase().includes(query);
          const matchOrg = event.organizerName.toLowerCase().includes(query);
          const matchVenue = event.venue.toLowerCase().includes(query);
          return matchTitle || matchDesc || matchCat || matchOrg || matchVenue;
        }
        return true;
      })
      .sort((a, b) => {
        if (sort === "recent") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sort === "deadline") {
          return (
            new Date(a.registrationDeadline).getTime() -
            new Date(b.registrationDeadline).getTime()
          );
        }
        // Default: upcoming (date asc)
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
  }, [initialEvents, search, category, sort, availability]);

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/90 via-primary to-indigo-950 p-8 sm:p-12 text-primary-foreground shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md border border-white/20">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>Discover Campus Life</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Upcoming College Events
          </h1>
          <p className="text-primary-foreground/90 text-sm sm:text-base leading-relaxed">
            Explore workshops, hackathons, cultural fests, and sports competitions happening across campus. Register today!
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by event name, category, organizer..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5 border rounded-md px-3 py-1.5 text-sm bg-background">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <select
                className="bg-transparent focus:outline-none text-sm font-medium"
                value={sort}
                onChange={(e) => setSort(e.target.value as "upcoming" | "recent" | "deadline")}
              >
                <option value="upcoming">Upcoming Date</option>
                <option value="recent">Recently Added</option>
                <option value="deadline">Registration Deadline</option>
              </select>
            </div>
            <div className="flex items-center gap-1.5 border rounded-md px-3 py-1.5 text-sm bg-background">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                className="bg-transparent focus:outline-none text-sm font-medium"
                value={availability}
                onChange={(e) => setAvailability(e.target.value as "all" | "open")}
              >
                <option value="all">All Events</option>
                <option value="open">Open Registration Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
                category === cat
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Event Cards Grid */}
      {filteredEvents.length === 0 ? (
        <EmptyState
          title="No events found"
          description="No events match your current search or filter criteria. Try adjusting filters or search terms."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch("");
            setCategory("All");
            setAvailability("all");
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const count = event.registrationCount || 0;
            const max = event.maxParticipants;
            const isFull = count >= max;
            const isDeadlinePassed = new Date(event.registrationDeadline) < new Date();
            const isOpen = !isFull && !isDeadlinePassed;

            return (
              <Card
                key={event.id}
                className="flex flex-col overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border-border/80"
              >
                {/* Poster / Placeholder Banner */}
                <div className="relative h-44 w-full bg-gradient-to-r from-slate-900 to-indigo-950 overflow-hidden flex items-center justify-center">
                  {event.posterUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={event.posterUrl}
                      alt={event.title}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4 text-center text-slate-300">
                      <Calendar className="h-10 w-10 mb-2 opacity-50 text-indigo-400" />
                      <span className="font-semibold text-sm line-clamp-1">{event.title}</span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge variant="secondary" className="backdrop-blur-md bg-background/80 shadow-xs font-semibold">
                      {event.category}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    {isOpen ? (
                      <Badge variant="success" className="shadow-xs">Open</Badge>
                    ) : isFull ? (
                      <Badge variant="warning" className="shadow-xs">Full</Badge>
                    ) : (
                      <Badge variant="destructive" className="shadow-xs">Closed</Badge>
                    )}
                  </div>
                </div>

                <CardHeader className="space-y-2 flex-1">
                  <div className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                    <span>By {event.organizerName}</span>
                  </div>
                  <CardTitle className="text-lg font-bold leading-snug line-clamp-2 hover:text-primary transition-colors">
                    <Link href={`/events/${event.id}`}>{event.title}</Link>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>
                </CardHeader>

                <CardContent className="space-y-2 text-xs text-muted-foreground border-t pt-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>
                      {new Date(event.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{event.startTime} - {event.endTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="line-clamp-1">{event.venue}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5 font-medium text-foreground">
                      <Users className="h-3.5 w-3.5 text-primary" />
                      <span>
                        {count} / {max} Registered
                      </span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-0 p-4">
                  <Button asChild className="w-full" size="sm">
                    <Link href={`/events/${event.id}`}>View Details & Register</Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
