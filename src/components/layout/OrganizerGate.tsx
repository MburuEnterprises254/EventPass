// Route-level access gate for the /organizer area. Only ORGANIZER-role users
// may pass; everyone else sees a clear "organizer access only" state.
// The authoritative check stays server-side on every protected server function
// (requireRole in src/lib/auth/authServer.ts) — this gate is UX, not security.
import { Link } from "@tanstack/react-router";
import { Lock, Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { useSession } from "~/lib/auth/useSession";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "~/components/ui/card";

export function OrganizerGate({ children }: { children: ReactNode }) {
  const { session } = useSession();

  // Session still resolving…
  if (session === undefined) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Checking your access…</span>
        </div>
      </div>
    );
  }

  // Not signed in: ask them to sign in first (organizer accounts are provisioned
  // by the platform admin).
  if (session === null) {
    return (
      <div className="mx-auto max-w-md px-4 py-20">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Lock className="h-6 w-6" />
            </div>
            <CardTitle>Organizer access only</CardTitle>
            <CardDescription>
              This area is for event organizers. Sign in to continue — if your account isn&apos;t an
              organizer account yet, ask the platform admin to upgrade it.
            </CardDescription>
            <div className="mt-2 flex gap-3">
              <Link to="/sign-in">
                <Button>Sign in</Button>
              </Link>
              <Link to="/">
                <Button variant="outline">Back to home</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Signed in, but not an organizer.
  if (session.role !== "ORGANIZER") {
    return (
      <div className="mx-auto max-w-md px-4 py-20">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <Lock className="h-6 w-6" />
            </div>
            <CardTitle>Organizer access only</CardTitle>
            <CardDescription>
              Your account is a {session.role.replace(/_/g, " ").toLowerCase()} account. To create and
              manage events you need an organizer account — ask the platform admin to upgrade your
              role.
            </CardDescription>
            <Link to="/">
              <Button variant="outline">Back to home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}