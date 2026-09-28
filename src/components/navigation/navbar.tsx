"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Compass, LayoutDashboard, Shield, User, LogOut } from "lucide-react";
import { useSession, signOut } from "@/lib/auth/auth-client";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const user = session?.user;
  const role = ((user as Record<string, unknown> | undefined)?.role as string) || "student";

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Calendar className="h-5 w-5" />
          </div>
          <span>UniEvents</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            href="/events"
            className={`flex items-center gap-1.5 transition-colors hover:text-foreground ${
              pathname.startsWith("/events") ? "text-foreground font-semibold" : "text-muted-foreground"
            }`}
          >
            <Compass className="h-4 w-4" />
            Discover Events
          </Link>

          {(!user || role === "student" || role === "admin") && (
            <Link
              href="/dashboard"
              className={`flex items-center gap-1.5 transition-colors hover:text-foreground ${
                pathname.startsWith("/dashboard") ? "text-foreground font-semibold" : "text-muted-foreground"
              }`}
            >
              <User className="h-4 w-4" />
              Student Dashboard
            </Link>
          )}

          {(role === "organizer" || role === "admin") && (
            <Link
              href="/organizer"
              className={`flex items-center gap-1.5 transition-colors hover:text-foreground ${
                pathname.startsWith("/organizer") ? "text-foreground font-semibold" : "text-muted-foreground"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Organizer Portal
            </Link>
          )}

          {role === "admin" && (
            <Link
              href="/admin"
              className={`flex items-center gap-1.5 transition-colors hover:text-foreground ${
                pathname.startsWith("/admin") ? "text-foreground font-semibold" : "text-muted-foreground"
              }`}
            >
              <Shield className="h-4 w-4" />
              Admin Panel
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {isPending ? (
            <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-semibold leading-none">{user.name}</span>
                <span className="text-xs text-muted-foreground capitalize mt-0.5">{role}</span>
              </div>
              <Badge
                variant={
                  role === "admin"
                    ? "destructive"
                    : role === "organizer"
                    ? "secondary"
                    : "outline"
                }
                className="capitalize hidden sm:inline-flex"
              >
                {role}
              </Badge>
              <Button variant="ghost" size="sm" onClick={handleSignOut} title="Sign Out">
                <LogOut className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
