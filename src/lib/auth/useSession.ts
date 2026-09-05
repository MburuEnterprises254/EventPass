// Client-side session hook. Calls the getSession server function (a thin RPC
// stub in the browser) so pages can be role-aware without exposing anything
// server-only.
import { useCallback, useEffect, useState } from "react";
import { getSession } from "~/lib/auth/authServer";
import type { SessionPrincipal } from "~/lib/auth/authServer";

export function useSession() {
  const [session, setSession] = useState<SessionPrincipal | null | undefined>(undefined);

  useEffect(() => {
    let active = true;
    getSession()
      .then((s) => {
        if (active) setSession(s);
      })
      .catch(() => {
        if (active) setSession(null);
      });
    return () => {
      active = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    try {
      setSession(await getSession());
    } catch {
      setSession(null);
    }
  }, []);

  return { session, refresh };
}