import { Ticket } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Ticket className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">EventPass</span>
        </div>
        <p className="text-sm text-muted-foreground">
          The multi-tenant ticketing platform for cinemas, theatres, concerts & events.
        </p>
      </div>
    </footer>
  );
}
