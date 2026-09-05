// Ticket types: name, price, currency, quantity, sale window, per-order limit,
// promo-code eligibility. Multiple types per event.
import { Plus, Tag, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { FieldError } from "./helpers";

export type TicketTypeDraft = {
  name: string;
  price: string;
  quantity: string;
  perOrderLimit: string;
  promoEligible: boolean;
  salesStartAt: string;
  salesEndAt: string;
};

export function emptyTicketType(): TicketTypeDraft {
  return {
    name: "",
    price: "",
    quantity: "100",
    perOrderLimit: "",
    promoEligible: true,
    salesStartAt: "",
    salesEndAt: "",
  };
}

export function TicketsBuilder({
  currency,
  ticketTypes,
  onChange,
  errors,
}: {
  currency: string;
  ticketTypes: TicketTypeDraft[];
  onChange: (next: TicketTypeDraft[]) => void;
  errors?: Record<string, string | undefined>;
}) {
  const update = (i: number, patch: Partial<TicketTypeDraft>) =>
    onChange(ticketTypes.map((t, idx) => (idx === i ? { ...t, ...patch } : t)));
  const remove = (i: number) => onChange(ticketTypes.filter((_, idx) => idx !== i));

  const add = () => onChange([...ticketTypes, emptyTicketType()]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Tag className="h-4 w-4" />
          <span className="text-sm font-medium text-foreground">
            Ticket types ({ticketTypes.length})
          </span>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={add}>
          <Plus className="h-4 w-4" />
          Add ticket type
        </Button>
      </div>

      <FieldError message={errors?.ticketTypes} />

      {ticketTypes.length === 0 && (
        <p className="rounded-md border border-dashed bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
          Add at least one ticket type — e.g. Adult, Child, VIP.
        </p>
      )}

      <div className="space-y-4">
        {ticketTypes.map((t, i) => (
          <div key={i} className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">Ticket type #{i + 1}</p>
              <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)} aria-label="Remove ticket type">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor={`tt-name-${i}`}>Name *</Label>
                <Input
                  id={`tt-name-${i}`}
                  value={t.name}
                  onChange={(e) => update(i, { name: e.target.value })}
                  placeholder="Adult"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`tt-price-${i}`}>Price ({currency}) *</Label>
                <Input
                  id={`tt-price-${i}`}
                  inputMode="decimal"
                  value={t.price}
                  onChange={(e) => update(i, { price: e.target.value })}
                  placeholder="e.g. 1200.00"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`tt-qty-${i}`}>Quantity available *</Label>
                <Input
                  id={`tt-qty-${i}`}
                  type="number"
                  min={1}
                  max={999999}
                  value={t.quantity}
                  onChange={(e) => update(i, { quantity: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`tt-limit-${i}`}>Per-order limit</Label>
                <Input
                  id={`tt-limit-${i}`}
                  type="number"
                  min={1}
                  max={100}
                  value={t.perOrderLimit}
                  onChange={(e) => update(i, { perOrderLimit: e.target.value })}
                  placeholder="e.g. 6 (blank = no limit)"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`tt-start-${i}`}>Sales start (optional)</Label>
                <Input
                  id={`tt-start-${i}`}
                  type="datetime-local"
                  value={t.salesStartAt}
                  onChange={(e) => update(i, { salesStartAt: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`tt-end-${i}`}>Sales end (optional)</Label>
                <Input
                  id={`tt-end-${i}`}
                  type="datetime-local"
                  value={t.salesEndAt}
                  onChange={(e) => update(i, { salesEndAt: e.target.value })}
                />
              </div>
            </div>

            <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={t.promoEligible}
                onChange={(e) => update(i, { promoEligible: e.target.checked })}
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
              />
              Promo codes may apply to this ticket type
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}