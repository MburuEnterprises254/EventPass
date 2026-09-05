import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Header } from "~/components/layout/Header";
import { Footer } from "~/components/layout/Footer";
import { OrganizerGate } from "~/components/layout/OrganizerGate";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { listOrganizerEvents, type EventListItem } from "~/lib/event/eventServer";
import { useSession } from "~/lib/auth/useSession";

export const Route = createFileRoute("/organizer")({
  component: OrganizerDashboard,
});

type DashState =
  | { type: "loading" }
  | { type: "loaded"; dbConnected: boolean; events: EventListItem[]; organizerName: string | null }
  | { type: "error"; message: string };

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ticketSummary(events: EventListItem[]): number {
  return events.reduce(
    (sum, e) => sum + e.ticketTypes.reduce((s, t) => s + (t.quantitySold ?? 0), 0),
    0,
  );
}

function OrganizerDashboard() {
  const { session } = useSession();
  const [state, setState] = useState<DashState>({ type: "loading" });

  useEffect(() => {
    let active = true;
    listOrganizerEvents()
      .then((res) => {
        if (active) setState({ type: "loaded", ...res });
      })
      .catch((err) => {
        if (active)
          setState({
            type: "error",
            message: err instanceof Error ? err.message : "Could not load your events.",
          });
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <OrganizerGate>
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Welcome back, {session?.name?.split(" ")[0] ?? "organizer"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Create events, set seating and pricing, and manage your listings.
              </p>
            </div>
            <Link to="/organizer/events/new">
              <Button className="w-full sm:w-auto">
                <PlusCircle className="h-4 w-4" />
                Create event
              </Button>
            </Link>
          </div>

          {state.type === "loading" && (
            <div className="flex items-center gap-3 py-16 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading your events…</span>
            </div>
          )}

          {state.type === "error" && (
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-destructive">{state.message}</p>
              </CardContent>
            </Card>
          )}

          {state.type === "loaded" && !state.dbConnected && (
            <Card>
              <CardHeader>
                <CardTitle>Your events will appear here</CardTitle>
                <CardDescription>
                  The database isn&apos;t connected yet, so there&apos;s nothing to list. Once the
                  platform connects Postgres, your events show up automatically — you don&apos;t need
                  to do anything.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/organizer/events/new" className="inline-flex">
                  <Button variant="outline">
                    <PlusCircle className="h-4 w-4" />
                    Create your first event
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {state.type === "loaded" && state.dbConnected && state.events.length === 0 && (
            <Card>
              <CardHeader>
                <CardTitle>No events yet</CardTitle>
                <CardDescription>
                  Create your first event to start selling tickets. It&apos;s a live draft until you
                  publish it.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/organizer/events/new" className="inline-flex">
                  <Button>
                    <PlusCircle className="h-4 w-4" />
                    Create event
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {state.type === "loaded" && state.dbConnected && state.events.length > 0 && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Events</p>
                    <p className="mt-1 text-3xl font-bold">{state.events.length}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">
                      Tickets sold across all events
                    </p>
                    <p className="mt-1 text-3xl font-bold">{ticketSummary(state.events)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Upcoming</p>
                    <p className="mt-1 text-3xl font-bold">
                      {state.events.filter((e) => new Date(e.startsAt) > new Date()).length}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-3">
                {state.events.map((event) => (
                  <Card key={event.id}>
                    <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{event.name}</p>
                          <Badge
                            variant={event.status === "PUBLISHED" ? "success" : "secondary"}
                          >
                            {event.status === "PUBLISHED" ? "Published" : "Draft"}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {formatDate(event.startsAt)}
                          {event.venueName ? ` · ${event.venueName}` : ""} ·{" "}
                          {event.seatingKind === "RESERVED" ? "Reserved seating" : "General admission"}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {event.capacity?.toLocaleString() ?? "—"} capacity ·{" "}
                          {event.ticketTypes.length} ticket type
                          {event.ticketTypes.length === 1 ? "" : "s"} ·{" "}
                          {event.ticketTypes.reduce((s, t) => s + t.quantityAvailable, 0)} tickets
                          on sale
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Tickets sold</p>
                          <p className="font-semibold">
                            {event.ticketTypes.reduce((s, t) => s + (t.quantitySold ?? 0), 0)}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" disabled title="Event details land in a later milestone">
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </OrganizerGate>
      </main>
      <Footer />
    </div>
  );
}