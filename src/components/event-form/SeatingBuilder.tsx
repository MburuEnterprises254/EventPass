// Seating builder: GA sections (capacity) or reserved sections (rows + seat
// ranges → individual seats auto-generated on the server).
import { Plus, Trash2, Users } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import type { GaSectionInput, ReservedSectionInput, RowInput } from "~/lib/event/validation";
import { computeCapacity, FieldError, sectionSeatCount } from "./helpers";

export type SectionDraft = GaSectionInput | ReservedSectionInput;

export function SeatingBuilder({
  sections,
  onChange,
  errors,
}: {
  sections: SectionDraft[];
  onChange: (next: SectionDraft[]) => void;
  errors?: Record<string, string | undefined>;
}) {
  const update = (i: number, patch: Partial<SectionDraft>) =>
    onChange(sections.map((s, idx) => (idx === i ? ({ ...s, ...patch } as SectionDraft) : s)));
  const remove = (i: number) => onChange(sections.filter((_, idx) => idx !== i));

  const addGa = () =>
    onChange([...sections, { kind: "GENERAL_ADMISSION", name: "", capacity: 0 } satisfies GaSectionInput]);
  const addReserved = () =>
    onChange([...sections, { kind: "RESERVED", name: "", rows: [] } satisfies ReservedSectionInput]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="h-4 w-4" />
          <span className="text-sm font-medium text-foreground">
            Sections{computeCapacity(sections) > 0 ? ` — ${computeCapacity(sections).toLocaleString()} seats` : ""}
          </span>
        </div>
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="outline" onClick={addGa}>
            <Plus className="h-4 w-4" />
            GA section
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={addReserved}>
            <Plus className="h-4 w-4" />
            Reserved section
          </Button>
        </div>
      </div>

      <FieldError message={errors?.sections} />

      {sections.length === 0 && (
        <p className="rounded-md border border-dashed bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
          No sections yet. Add a general-admission section (standing area) or a reserved section
          with rows and seats.
        </p>
      )}

      <div className="space-y-4">
        {sections.map((section, i) =>
          section.kind === "GENERAL_ADMISSION" ? (
            <GaSectionCard
              key={i}
              section={section}
              onChange={(patch) => update(i, patch)}
              onRemove={() => remove(i)}
            />
          ) : (
            <ReservedSectionCard
              key={i}
              section={section}
              onChange={(patch) => update(i, patch)}
              onRemove={() => remove(i)}
            />
          ),
        )}
      </div>
    </div>
  );
}

// ── GA section ─────────────────────────────────────────────────────────────

function GaSectionCard({
  section,
  onChange,
  onRemove,
}: {
  section: GaSectionInput;
  onChange: (patch: Partial<GaSectionInput>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">General admission section</p>
        <Button type="button" variant="ghost" size="icon" onClick={onRemove} aria-label="Remove section">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`ga-name-${section.name}`}>Section name *</Label>
          <Input
            id={`ga-name-${section.name}`}
            value={section.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="GA Floor"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`ga-cap-${section.name}`}>Capacity *</Label>
          <Input
            id={`ga-cap-${section.name}`}
            type="number"
            min={0}
            max={100000}
            value={section.capacity === 0 ? "" : section.capacity}
            onChange={(e) => onChange({ capacity: Number(e.target.value) || 0 })}
            placeholder="e.g. 300"
          />
        </div>
      </div>
    </div>
  );
}

// ── Reserved section ───────────────────────────────────────────────────────

function ReservedSectionCard({
  section,
  onChange,
  onRemove,
}: {
  section: ReservedSectionInput;
  onChange: (patch: Partial<ReservedSectionInput>) => void;
  onRemove: () => void;
}) {
  const seatCount = sectionSeatCount(section.rows);
  const setRows = (rows: RowInput[]) => onChange({ rows });

  const addRow = () =>
    setRows([
      ...section.rows,
      { label: nextRowLabel(section.rows), start: 1, end: 10 },
    ]);

  const updateRow = (i: number, patch: Partial<RowInput>) =>
    setRows(section.rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const removeRow = (i: number) => setRows(section.rows.filter((_, idx) => idx !== i));

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">Reserved section — {seatCount.toLocaleString()} seats</p>
        <Button type="button" variant="ghost" size="icon" onClick={onRemove} aria-label="Remove section">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-3 space-y-2">
        <Label>Section name *</Label>
        <Input
          value={section.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Orchestra, Balcony, Stage Left..."
        />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm font-medium">Rows & seats</p>
        <Button type="button" size="sm" variant="outline" onClick={addRow}>
          <Plus className="h-4 w-4" />
          Add row
        </Button>
      </div>

      {section.rows.length === 0 && (
        <p className="mt-2 rounded-md border border-dashed bg-muted/30 px-4 py-4 text-center text-xs text-muted-foreground">
          Add a row and a seat-number range — e.g. row &quot;A&quot;, seats 1–12 creates A1 … A12,
          then A13 if you extend the range.
        </p>
      )}

      <div className="mt-2 space-y-2">
        {section.rows.map((row, i) => (
          <div key={`${row.label}-${i}`} className="grid grid-cols-12 items-end gap-2 rounded-md bg-muted/30 p-2">
            <div className="col-span-5 space-y-1">
              <Label className="text-xs">Row label</Label>
              <Input
                value={row.label}
                onChange={(e) => updateRow(i, { label: e.target.value })}
                placeholder="A"
              />
            </div>
            <div className="col-span-3 space-y-1">
              <Label className="text-xs">From</Label>
              <Input
                type="number"
                min={1}
                max={999}
                value={row.start}
                onChange={(e) => updateRow(i, { start: Number(e.target.value) || 1 })}
              />
            </div>
            <div className="col-span-3 space-y-1">
              <Label className="text-xs">To</Label>
              <Input
                type="number"
                min={1}
                max={9999}
                value={row.end}
                onChange={(e) => updateRow(i, { end: Number(e.target.value) || 1 })}
              />
            </div>
            <div className="col-span-1">
              <Button type="button" variant="ghost" size="icon" onClick={() => removeRow(i)} aria-label="Remove row">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <p className="col-span-12 text-xs text-muted-foreground">
              Creates {row.end - row.start + 1} seats · e.g. {row.label.trim() || "A"}
              {row.start} … {row.label.trim() || "A"}
              {row.end}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Suggest the next row label after the last alphabetical one (A → B … Z → AA). */
function nextRowLabel(rows: RowInput[]): string {
  const letters = rows.map((r) => (r.label.trim().toUpperCase().match(/^[A-Z]+/) ?? ["A"])[0]);
  const max = letters.reduce((m, l) => {
    let v = 0;
    for (const ch of l) v = v * 26 + (ch.charCodeAt(0) - 64);
    return Math.max(m, v);
  }, 0);
  return numToLetters(max + 1);
}

function numToLetters(n: number): string {
  let s = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}