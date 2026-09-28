"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { signUp, signIn } from "@/lib/auth/auth-client";
import { Calendar, Lock, Mail, User as UserIcon, Loader2, GraduationCap, LayoutDashboard } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function RegisterPage() {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "organizer">("student");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      showError("Please fill in all required fields");
      return;
    }

    if (password.length < 6) {
      showError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await signUp.email({
        name,
        email,
        password,
        role,
      } as Parameters<typeof signUp.email>[0]);

      if (error) {
        if (error.message?.toLowerCase().includes("already") || error.status === 400 || error.status === 422) {
          showError("This email is already registered. Please go to Log In instead.");
        } else {
          showError(error.message || "Failed to create account.");
        }
      } else {
        showSuccess("Account created successfully!");
        router.push(role === "organizer" ? "/organizer" : "/events");
        router.refresh();
      }
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const res = await signIn.social({
        provider: "google",
        callbackURL: "/events",
      });
      if (res?.error) {
        showError(res.error.message || "Google OAuth initialization failed.");
        setIsGoogleLoading(false);
      }
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : "Google signup initiation failed");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-10rem)] py-12 px-4">
      <Card className="w-full max-w-md shadow-xl border-border/80">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-2">
            <Calendar className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Create an Account</CardTitle>
          <CardDescription>
            Join UniEvents to participate in or organize college events
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            type="button"
            className="w-full h-11 relative flex items-center justify-center gap-2 font-medium"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isLoading}
          >
            {isGoogleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            Sign up with Google
          </Button>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t w-full border-border" />
            <span className="bg-card px-3 text-xs text-muted-foreground uppercase font-semibold relative">
              Or fill out details
            </span>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label>I am registering as a:</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all ${
                    role === "student"
                      ? "border-primary bg-primary/10 text-primary font-semibold ring-2 ring-primary/20"
                      : "border-input bg-background hover:bg-muted"
                  }`}
                >
                  <GraduationCap className="h-4 w-4" />
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole("organizer")}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all ${
                    role === "organizer"
                      ? "border-primary bg-primary/10 text-primary font-semibold ring-2 ring-primary/20"
                      : "border-input bg-background hover:bg-muted"
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Organizer
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className="pl-9"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="student@college.edu"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="•••••••• (Min 6 chars)"
                  className="pl-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-11" disabled={isLoading || isGoogleLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                `Register as ${role === "organizer" ? "Organizer" : "Student"}`
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t p-4 text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="ml-1 font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
