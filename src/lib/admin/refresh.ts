/**
 * One refresh at a time. When several requests fail with 401 together (a page with four queries
 * after fifteen idle minutes), the first one triggers `refresh()`; the others wait on the same
 * promise and retry with the same new token. A refresh token works once, so a second concurrent
 * refresh would not just be wasteful: the core treats a replayed token as theft and revokes the
 * whole session.
 */
export type RefreshOutcome<T> = { ok: true; value: T } | { ok: false; error: unknown };

export function createRefreshQueue<T>(refresh: () => Promise<T>) {
  let inFlight: Promise<RefreshOutcome<T>> | null = null;

  return {
    /** Resolves to the shared outcome; never rejects, so callers decide what a failure means. */
    run(): Promise<RefreshOutcome<T>> {
      if (!inFlight) {
        inFlight = refresh()
          .then((value): RefreshOutcome<T> => ({ ok: true, value }))
          .catch((error): RefreshOutcome<T> => ({ ok: false, error }))
          .finally(() => {
            inFlight = null;
          });
      }
      return inFlight;
    },
    get pending() {
      return inFlight !== null;
    },
  };
}
