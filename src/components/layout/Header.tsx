import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Ticket } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useSession } from "~/lib/auth/useSession";
import { signOut } from "~/lib/auth/authServer";

export function Header() {
  const { session } = useSession();
  const navigate = useNavigate();

  async function onSignOut() {
    try {
      await signOut();
    } finally {
      navigate({ to: "/" });
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <Ticket className="h-6 w-6 text-primary" />
          <span className="text-lg">EventPass</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            to="/"
            className="hidden px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:underline sm:inline-flex"
          >
            Home
          </Link>
          {session?.role === "ORGANIZER" && (
            <Link
              to="/organizer"
              className="hidden px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:underline sm:inline-flex"
            >
              Organizer
            </Link>
          )}
          {session ? (
            <>
              <span className="hidden text-sm text-muted-foreground md:inline">
                {session.name ?? session.email}
              </span>
              <Button variant="ghost" size="sm" onClick={onSignOut}>
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link to="/sign-in">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link to="/sign-up">
                <Button size="sm">Create account</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}