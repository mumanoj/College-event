import Link from "next/link";
import { eventService } from "@/lib/services/event.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ArrowRight, ShieldCheck, Sparkles, Users, MapPin, Clock } from "lucide-react";

export const revalidate = 0;

export default async function HomePage() {
  const publishedEvents = await eventService.getPublishedEvents();
  const featuredEvents = publishedEvents.slice(0, 3);

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4 sm:px-8 text-center bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="container mx-auto max-w-4xl space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border bg-background text-xs font-semibold text-primary shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Official College Event Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
            Discover, Organize, & Participate in College Events
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The central platform for all campus workshops, hackathons, sports tournaments, and cultural fests.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Button size="lg" className="gap-2 px-6 shadow-md" asChild>
              <Link href="/events">
                Explore All Events <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="px-6" asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Upcoming Events Section */}
      {featuredEvents.length > 0 && (
        <section className="py-12 px-4 sm:px-8 bg-muted/20">
          <div className="container mx-auto max-w-6xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Featured Upcoming Events</h2>
                <p className="text-sm text-muted-foreground">Approved campus events with open registrations.</p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/events" className="flex items-center gap-1">
                  View Catalog <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredEvents.map((event) => (
                <Card key={event.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
                  <CardHeader className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{event.category}</Badge>
                      <Badge variant="success">Approved</Badge>
                    </div>
                    <CardTitle className="text-lg font-bold line-clamp-1">
                      <Link href={`/events/${event.id}`} className="hover:text-primary transition-colors">
                        {event.title}
                      </Link>
                    </CardTitle>
                    <p className="text-xs text-muted-foreground line-clamp-2">{event.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs text-muted-foreground border-t pt-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="line-clamp-1">{event.venue}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 p-4">
                    <Button asChild size="sm" className="w-full">
                      <Link href={`/events/${event.id}`}>View & Register</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Feature Highlights Grid */}
      <section className="py-16 px-4 sm:px-8 border-t">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-xl border bg-card shadow-xs space-y-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Users className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold">For Students</h2>
              <p className="text-sm text-muted-foreground">
                Browse verified campus events, answer custom registration questions, and manage your participation.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-xl border bg-card shadow-xs space-y-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Calendar className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold">For Organizers</h2>
              <p className="text-sm text-muted-foreground">
                Create events, customize registration forms, monitor student registrations, and manage deadlines.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-xl border bg-card shadow-xs space-y-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold">For Admins</h2>
              <p className="text-sm text-muted-foreground">
                Approve or reject events with feedback, view college-wide analytics, and oversee users.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
