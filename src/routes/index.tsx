import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarPlus, QrCode, ShieldCheck, Sparkles, Ticket } from "lucide-react";
import { Header } from "~/components/layout/Header";
import { Footer } from "~/components/layout/Footer";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";

export const Route = createFileRoute("/")({
  component: Home,
});

const valueProps = [
  {
    icon: CalendarPlus,
    title: "Create your event",
    body: "Set a venue, capacity, and ticket types in minutes. General admission or fully reserved seating with sections, rows and individual seats.",
  },
  {
    icon: Ticket,
    title: "Sell tickets",
    body: "Price tiers, promo codes and a pluggable payment layer (M-Pesa, Stripe, card). Every ticket gets a unique ID and a signed QR code.",
  },
  {
    icon: QrCode,
    title: "Check-in at the door",
    body: "Scan QR codes and validate instantly — valid, already used, or not paid — with a full audit trail for staff and organizers.",
  },
];

function Home() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="mx-auto max-w-6xl px-4 pb-20 pt-20 text-center sm:px-6 sm:pt-28">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              Launching soon — multi-tenant ticketing
            </div>
            <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight sm:text-6xl">
              Sell every seat,{" "}
              <span className="bg-gradient-to-r from-primary to-fuchsia-500 bg-clip-text text-transparent">
                then fill it
              </span>
              .
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              EventPass is the ticketing platform for cinemas, theatres, concerts and community
              events. Create an event, sell tickets, and check people in at the door — all in one
              place.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/sign-up">
                <Button size="lg" className="w-full sm:w-auto">
                  Create your event
                </Button>
              </Link>
              <Link to="/sign-in">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Sign in
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Value props */}
        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <div className="grid gap-6 md:grid-cols-3">
            {valueProps.map(({ icon: Icon, title, body }) => (
              <Card key={title} className="border bg-card">
                <CardContent className="space-y-4 p-6">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="text-sm text-muted-foreground">{body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Seating + trust strip */}
        <section className="border-t bg-muted/30">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Seating that scales from a single screen to a full theatre.
              </h2>
              <p className="mt-4 text-muted-foreground">
                Model venues as general admission or reserved sections with rows and individual
                seats. Hold seats during checkout, release them on timeout, and never oversell.
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {[
                  "General admission & reserved seating",
                  "Sections, rows and individual seats",
                  "Ticket types, pricing & promo codes",
                  "Role-based access for organizers and staff",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border bg-card p-8 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Ticket className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Sample event</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {["A1", "A2", "B1", "B2", "C1", "C2", "D1", "D2"].map((seat, i) => (
                  <div
                    key={seat}
                    className={`rounded-lg border p-4 text-center text-sm font-medium ${
                      i % 3 === 0
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    {i % 3 === 0 ? `${seat} · held` : seat}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to sell out your next event?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Sign up free to create your first event today. Payments and check-in are right around
            the corner.
          </p>
          <div className="mt-8">
            <Link to="/sign-up">
              <Button size="lg">Get started — it&apos;s free</Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
