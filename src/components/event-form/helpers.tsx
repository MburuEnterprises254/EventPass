// Shared helper components + pure functions for the event creation form.
import type { RowInput } from "~/lib/event/validation";

/** Pretty date — unlike toLocaleString, locale-independent (yyyy-mm-DD HH:mm). */
export function prettyDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Formats a money string ("1200.00") with the event's currency. */
export function formatMoney(amount: string, currency: string): string {
  const n = Number(amount);
  if (!Number.isFinite(n)) return amount;
  const symbol =
    currency === "USD" ? "US$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "KSh ";
  const [whole] = amount.split(".");
  const frac = amount.includes(".") ? `.${amount.split(".")[1].padEnd(2, "0").slice(0, 2)}` : "";
  return `${symbol}${whole}${frac}`;
}

export function seatsForRow(row: RowInput): number {
  return row.end - row.start + 1;
}

export function sectionSeatCount(rows: RowInput[] | undefined): number {
  if (!rows) return 0;
  return rows.reduce((sum, r) => sum + seatsForRow(r), 0);
}

export function computeCapacity(sections: unknown[]): number {
  let total = 0;
  for (const s of sections as Array<{ kind: string; capacity?: number; rows?: RowInput[] }>) {
    if (s.kind === "GENERAL_ADMISSION") total += s.capacity ?? 0;
    else total += sectionSeatCount(s.rows);
  }
  return total;
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs font-medium text-destructive">{message}</p>;
}