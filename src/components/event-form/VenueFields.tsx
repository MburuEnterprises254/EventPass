// Venue section of the event form: name, address, city, country, timezone, capacity.
import { MapPin } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { FieldError } from "./helpers";

export type VenueFormState = {
  name: string;
  address: string;
  city: string;
  country: string;
  timezone: string;
  capacity: string;
};

export function emptyVenue(): VenueFormState {
  return { name: "", address: "", city: "", country: "", timezone: "", capacity: "" };
}

export function VenueFields({
  value,
  onChange,
  errors,
}: {
  value: VenueFormState;
  onChange: (v: VenueFormState) => void;
  errors?: Record<string, string | undefined>;
}) {
  const set = (patch: Partial<VenueFormState>) => onChange({ ...value, ...patch });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <MapPin className="h-4 w-4" />
        <span className="text-sm font-medium text-foreground">Venue</span>
      </div>

      <div className="space-y-2">
        <Label htmlFor="venue-name">Venue name *</Label>
        <Input
          id="venue-name"
          value={value.name}
          onChange={(e) => set({ name: e.target.value })}
          placeholder="The Grand Cinema, KICC, ..."
        />
        <FieldError message={errors?.name} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="venue-address">Address</Label>
          <Input
            id="venue-address"
            value={value.address}
            onChange={(e) => set({ address: e.target.value })}
            placeholder="Harambee Avenue"
          />
          <FieldError message={errors?.address} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="venue-city">City</Label>
          <Input
            id="venue-city"
            value={value.city}
            onChange={(e) => set({ city: e.target.value })}
            placeholder="Nairobi"
          />
          <FieldError message={errors?.city} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="venue-country">Country</Label>
          <Input
            id="venue-country"
            value={value.country}
            onChange={(e) => set({ country: e.target.value })}
            placeholder="Kenya"
          />
          <FieldError message={errors?.country} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="venue-timezone">Timezone (IANA, optional)</Label>
          <Input
            id="venue-timezone"
            value={value.timezone}
            onChange={(e) => set({ timezone: e.target.value })}
            placeholder="Africa/Nairobi"
          />
          <FieldError message={errors?.timezone} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="venue-capacity">Venue capacity (optional)</Label>
        <Input
          id="venue-capacity"
          type="number"
          min={0}
          max={100000}
          value={value.capacity}
          onChange={(e) => set({ capacity: e.target.value })}
          placeholder="e.g. 1200"
        />
        <p className="text-xs text-muted-foreground">
          Leave blank to derive capacity from your sections below.
        </p>
        <FieldError message={errors?.capacity} />
      </div>
    </div>
  );
}