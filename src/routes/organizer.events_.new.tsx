import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, CalendarDays, CheckCircle2, Loader2 } from "lucide-react";
import { useMemo, useRef, useState, type FormEvent } from "react";
import { Header } from "~/components/layout/Header";
import { Footer } from "~/components/layout/Footer";
import { OrganizerGate } from "~/components/layout/OrganizerGate";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent } from "~/components/ui/card";
import { VenueFields, emptyVenue, type VenueFormState } from "~/components/event-form/VenueFields";
import { SeatingBuilder, type SectionDraft } from "~/components/event-form/SeatingBuilder";
import { TicketsBuilder, emptyTicketType, type TicketTypeDraft } from "~/components/event-form/TicketsBuilder";
import { computeCapacity, FieldError, formatMoney, prettyDate } from "~/components/event-form/helpers";
import { createEvent, EventError } from "~/lib/event/eventServer";
import { createEventSchema, type CreateEventInput } from "~/lib/event/validation";

export const Route = createFileRoute("/organizer/events_/new")({
  component: NewEventPage,
});

const DATE_INPUT_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

function toIso(dt: string, timezone: string | undefined): string | undefined {
  if (dt && DATE_INPUT_REGEX.test(dt)) return `${dt}:00${timezone ? timezone : "Z"}`;
  return undefined;
}

function zodIssues(err: unknown): Record<string, string | undefined> {
  if (err && typeof err === "object" && "issues" in err && Array.isArray(err.issues)) {
    const issues = (err as { issues: Array<{ path: (string | number)[]; message: string }> }).issues;
    const map: Record<string, string | undefined> = {};
    for (const i of issues) {
      const key = i.path.join(".");
      if (!map[key]) map[key] = i.message;
    }
    return map;
  }
  return {};
}

type NewEventState = {
  name: string;
  description: string;
  startsAt: string;
  endsAt: string;
  status: "DRAFT" | "PUBLISHED";
  capacity: string;
  imageUrl: string;
  currency: "USD" | "KES" | "EUR" | "GBP";
  salesStartAt: string;
  salesEndAt: string;
  seatingKind: "GENERAL_ADMISSION" | "RESERVED";
  venue: VenueFormState;
  sections: SectionDraft[];
  ticketTypes: TicketTypeDraft[];
};

function NewEventPage() {
  const [state, setState] = useState<NewEventState>(() => ({
    name: "",
    description: "",
    startsAt: "",
    endsAt: "",
    status: "DRAFT",
    capacity: "",
    imageUrl: "",
    currency: "KES",
    salesStartAt: "",
    salesEndAt: "",
    seatingKind: "GENERAL_ADMISSION",
    venue: emptyVenue(),
    sections: [],
    ticketTypes: [emptyTicketType()],
  }));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | undefined>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<{ id: string; name: string; startsAt: string } | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);

  const set = (patch: Partial<NewEventState>) => setState((s) => ({ ...s, ...patch }));

  const derivedCapacity = useMemo(() => computeCapacity(state.sections), [state.sections]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    setFieldErrors({});

    const tz = state.venue.timezone.trim() || undefined;
    const payload: CreateEventInput = {
      name: state.name,
      description: state.description,
      startsAt: toIso(state.startsAt, tz) ?? "",
      endsAt: state.endsAt ? (toIso(state.endsAt, tz) ?? null) : null,
      status: state.status,
      capacity: state.capacity === "" ? undefined : Number(state.capacity),
      imageUrl: state.imageUrl,
      currency: state.currency,
      salesStartAt: state.salesStartAt ? (toIso(state.salesStartAt, tz) ?? null) : null,
      salesEndAt: state.salesEndAt ? (toIso(state.salesEndAt, tz) ?? null) : null,
      seatingKind: state.seatingKind,
      venue: {
        name: state.venue.name,
        address: state.venue.address,
        city: state.venue.city,
        country: state.venue.country,
        timezone: tz ?? "",
        capacity: state.venue.capacity === "" ? undefined : Number(state.venue.capacity),
      },
      sections:
        state.seatingKind === "RESERVED"
          ? state.sections
          : state.sections.filter((s): s is SectionDraft & { kind: "GENERAL_ADMISSION" } => s.kind === "GENERAL_ADMISSION"),
      ticketTypes: state.ticketTypes.map((t) => ({
        name: t.name,
        price: t.price,
        quantity: t.quantity === "" ? 0 : Number(t.quantity),
        perOrderLimit: t.perOrderLimit === "" ? undefined : Number(t.perOrderLimit),
        promoEligible: t.promoEligible,
        salesStartAt: t.salesStartAt ? (toIso(t.salesStartAt, tz) ?? null) : null,
        salesEndAt: t.salesEndAt ? (toIso(t.salesEndAt, tz) ?? null) : null,
      })),
    };

    const parsed = createEventSchema.safeParse(payload);
    if (!parsed.success) {
      setFieldErrors(zodIssues(parsed.error));
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await createEvent({ data: payload });
      setCreated({
        id: res.event.id,
        name: res.event.name,
        startsAt: res.event.startsAt,
      });
      setSubmitting(false);
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (err) {
      setSubmitting(false);
      if (err instanceof EventError) {
        setSubmitError(err.message);
      } else if (err instanceof Error && err.message) {
        setSubmitError(err.message);
      } else {
        setSubmitError("Something went wrong while creating your event. Please try again.");
      }
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  if (created) {
    return (
      <div className="flex min-h-dvh flex-col bg-background">
        <Header />
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-16">
          <OrganizerGate>
            <Card>
              <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h1 className="text-2xl font-bold">Event created</h1>
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">{created.name}</span> ·{" "}
                  {prettyDate(created.startsAt)} has been saved as a draft. Ticket sales, payments
                  and check-in arrive in the next milestones.
                </p>
                <div className="mt-2 flex gap-3">
                  <Link to="/organizer">
                    <Button>Back to dashboard</Button>
                  </Link>
                  <Link to="/organizer/events/new">
                    <Button variant="outline">Create another event</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </OrganizerGate>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
        <OrganizerGate>
          <div ref={topRef} />
          <Link
            to="/organizer"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Create an event</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Everything is saved as a draft until you publish it.
            </p>
          </div>

          {submitError && (
            <div className="mb-6 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-8">
            {/* ── Event details ── */}
            <Card>
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  <span className="text-sm font-medium text-foreground">Event details</span>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event-name">Event name *</Label>
                  <Input
                    id="event-name"
                    value={state.name}
                    onChange={(e) => set({ name: e.target.value })}
                    placeholder="Jazz Night at The Grand"
                  />
                  <FieldError message={fieldErrors.name} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event-desc">Description</Label>
                  <Textarea
                    id="event-desc"
                    value={state.description}
                    onChange={(e) => set({ description: e.target.value })}
                    placeholder="What should attendees know?"
                    rows={4}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="event-start">Starts at *</Label>
                    <Input
                      id="event-start"
                      type="datetime-local"
                      required
                      value={state.startsAt}
                      onChange={(e) => set({ startsAt: e.target.value })}
                    />
                    <FieldError message={fieldErrors.startsAt} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="event-end">Ends at</Label>
                    <Input
                      id="event-end"
                      type="datetime-local"
                      value={state.endsAt}
                      onChange={(e) => set({ endsAt: e.target.value })}
                    />
                    <FieldError message={fieldErrors.endsAt} />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="event-status">Status</Label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => set({ status: "DRAFT" })}
                        className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                          state.status === "DRAFT"
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-input bg-background text-muted-foreground hover:bg-accent"
                        }`}
                      >
                        Draft
                      </button>
                      <button
                        type="button"
                        onClick={() => set({ status: "PUBLISHED" })}
                        className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                          state.status === "PUBLISHED"
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-input bg-background text-muted-foreground hover:bg-accent"
                        }`}
                      >
                        Publish
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Publish immediately, or keep it as a draft and publish later.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="event-currency">Currency</Label>
                    <select
                      id="event-currency"
                      value={state.currency}
                      onChange={(e) => set({ currency: e.target.value as NewEventState["currency"] })}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="KES">KES — Kenyan Shilling</option>
                      <option value="USD">USD — US Dollar</option>
                      <option value="EUR">EUR — Euro</option>
                      <option value="GBP">GBP — British Pound</option>
                    </select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="event-image">Thumbnail URL (optional)</Label>
                    <Input
                      id="event-image"
                      type="url"
                      value={state.imageUrl}
                      onChange={(e) => set({ imageUrl: e.target.value })}
                      placeholder="https://…/poster.jpg"
                    />
                    <FieldError message={fieldErrors.imageUrl} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Sales window (optional)</Label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input
                      type="datetime-local"
                      aria-label="Sales start"
                      value={state.salesStartAt}
                      onChange={(e) => set({ salesStartAt: e.target.value })}
                    />
                    <Input
                      type="datetime-local"
                      aria-label="Sales end"
                      value={state.salesEndAt}
                      onChange={(e) => set({ salesEndAt: e.target.value })}
                    />
                  </div>
                  <FieldError message={fieldErrors.salesEndAt} />
                </div>
              </CardContent>
            </Card>

            {/* ── Venue ── */}
            <Card>
              <CardContent className="p-6">
                <VenueFields value={state.venue} onChange={(venue) => set({ venue })} errors={fieldErrors} />
              </CardContent>
            </Card>

            {/* ── Seating ── */}
            <Card>
              <CardContent className="space-y-4 p-6">
                <div className="space-y-1.5">
                  <Label>Seating model *</Label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => set({ seatingKind: "GENERAL_ADMISSION" })}
                      className={`rounded-lg border p-4 text-left transition-colors ${
                        state.seatingKind === "GENERAL_ADMISSION"
                          ? "border-primary bg-primary/5"
                          : "border-input hover:bg-accent"
                      }`}
                    >
                      <p className="text-sm font-medium">General admission</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        No assigned seats — attendees fill any spot. Define one or more GA sections
                        with a capacity each.
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => set({ seatingKind: "RESERVED" })}
                      className={`rounded-lg border p-4 text-left transition-colors ${
                        state.seatingKind === "RESERVED"
                          ? "border-primary bg-primary/5"
                          : "border-input hover:bg-accent"
                      }`}
                    >
                      <p className="text-sm font-medium">Reserved seating</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Sections, rows and individual seats (A1, A2…). Each ticket maps to a specific
                        seat.
                      </p>
                    </button>
                  </div>
                </div>

                <SeatingBuilder
                  sections={state.sections}
                  onChange={(sections) => set({ sections })}
                  errors={fieldErrors}
                />
              </CardContent>
            </Card>

            {/* ── Capacity + ticket types ── */}
            <Card>
              <CardContent className="space-y-5 p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="event-capacity">Total capacity (optional)</Label>
                    <Input
                      id="event-capacity"
                      type="number"
                      min={0}
                      max={1000000}
                      value={state.capacity}
                      onChange={(e) => set({ capacity: e.target.value })}
                      placeholder={
                        derivedCapacity > 0 ? `Derived: ${derivedCapacity}` : "e.g. 500"
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      {derivedCapacity > 0
                        ? `Your sections total ${derivedCapacity.toLocaleString()} — leave blank to use that.`
                        : "Leave blank to derive from sections, or type a number to override."}
                    </p>
                    <FieldError message={fieldErrors.capacity} />
                  </div>
                  <div className="space-y-2">
                    <Label>Tickets available vs capacity</Label>
                    <p className="rounded-md bg-muted/40 px-3 py-3 text-sm text-muted-foreground">
                      {state.ticketTypes.reduce((s, t) => s + (Number(t.quantity) || 0), 0).toLocaleString()}{" "}
                      tickets for sale
                      {derivedCapacity > 0
                        ? ` · ${derivedCapacity.toLocaleString()} seats`
                        : ""}
                    </p>
                  </div>
                </div>

                <TicketsBuilder
                  currency={state.currency}
                  ticketTypes={state.ticketTypes}
                  onChange={(ticketTypes) => set({ ticketTypes })}
                  errors={fieldErrors}
                />
              </CardContent>
            </Card>

            <div className="flex flex-col-reverse items-stretch gap-3 pb-10 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                Pricing shown in {state.currency} · e.g. {formatMoney("1200.00", state.currency)} for an
                Adult ticket.
              </p>
              <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating event…
                  </>
                ) : (
                  "Create event"
                )}
              </Button>
            </div>
          </form>
        </OrganizerGate>
      </main>
      <Footer />
    </div>
  );
}