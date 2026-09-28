import Link from "next/link";
import { Calendar } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/40 py-8 md:py-12">
      <div className="container mx-auto px-4 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <div className="flex items-center gap-2 font-semibold">
          <Calendar className="h-5 w-5 text-primary" />
          <span>College Event Management System</span>
        </div>
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} UniEvents Platform. All rights reserved.
        </p>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <Link href="/events" className="hover:underline">
            Events
          </Link>
          <Link href="/login" className="hover:underline">
            Login
          </Link>
          <Link href="/register" className="hover:underline">
            Register
          </Link>
        </div>
      </div>
    </footer>
  );
}
