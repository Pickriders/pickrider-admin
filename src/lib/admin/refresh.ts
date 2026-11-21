import { apiErrorStatus } from "./auth-errors";

/**
 * One refresh at a time. When several requests fail with 401 together (a page with four queries
 * after fifteen idle minutes), the first one triggers `refresh()`; the others wait on the same
 * promise and retry with the same new token. A refresh token works once, so a second concurrent
 * refresh would not just be wasteful: the core treats a replay of a token it rotated more than a
 * minute ago as theft and revokes the whole session.
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

// ── Across tabs ────────────────────────────────────────────────────────────

/** The Web Locks name every admin tab refreshes under, so only one tab spends the refresh token. */
export const REFRESH_LOCK_NAME = "pr-admin-refresh";
/** The BroadcastChannel tabs tell each other about refreshes and sign-outs on. */
export const SESSION_CHANNEL_NAME = "pr-admin-session";

export type LockManagerLike = { request<T>(name: string, callback: () => Promise<T>): Promise<T> };

type LockOptions = {
  locks?: LockManagerLike | null;
  storage?: Pick<Storage, "getItem" | "setItem" | "removeItem"> | null;
  /** How long a localStorage lock is honoured if its tab died holding it. */
  ttlMs?: number;
  /** How long to wait for someone else's localStorage lock before going ahead anyway. */
  waitMs?: number;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function defaultLocks(): LockManagerLike | null {
  if (typeof navigator === "undefined") return null;
  const locks = (navigator as Navigator & { locks?: LockManagerLike }).locks;
  return locks && typeof locks.request === "function" ? locks : null;
}

function defaultStorage(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

/**
 * Runs `fn` while holding a lock shared by every tab of this browser: the Web Locks API where
 * there is one, else a localStorage lock with an expiry (so a tab closed mid-refresh cannot block
 * the others for long), else no lock at all.
 */
export async function withCrossTabLock<T>(name: string, fn: () => Promise<T>, options: LockOptions = {}): Promise<T> {
  const locks = options.locks === undefined ? defaultLocks() : options.locks;
  if (locks) return locks.request(name, fn);

  const storage = options.storage === undefined ? defaultStorage() : options.storage;
  if (!storage) return fn();

  const key = `@pickriders/lock:${name}`;
  const ttlMs = options.ttlMs ?? 15_000;
  const deadline = Date.now() + (options.waitMs ?? 20_000);
  const owner = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const read = (): { owner: string; expiresAt: number } | null => {
    try {
      const raw = storage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  let acquired = false;
  while (!acquired && Date.now() < deadline) {
    const held = read();
    if (!held || held.expiresAt < Date.now()) {
      try {
        storage.setItem(key, JSON.stringify({ owner, expiresAt: Date.now() + ttlMs }));
      } catch {
        return fn();
      }
      // Two tabs can both see the lock free; whoever wrote last owns it.
      await sleep(25);
      acquired = read()?.owner === owner;
    }
    if (!acquired) await sleep(50 + Math.random() * 100);
  }

  try {
    return await fn();
  } finally {
    if (acquired && read()?.owner === owner) {
      try {
        storage.removeItem(key);
      } catch {
        // The expiry frees it.
      }
    }
  }
}

/** The `exp` of a JWT in milliseconds, or null when it is not a readable JWT. */
export function tokenExpiryMs(token: string | undefined | null): number | null {
  if (!token) return null;
  const part = token.split(".")[1];
  if (!part) return null;
  try {
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const exp = Number(JSON.parse(atob(padded))?.exp);
    return Number.isFinite(exp) && exp > 0 ? exp * 1000 : null;
  } catch {
    return null;
  }
}

/** There is no refresh token left to try (signed out in another tab, cookies cleared). */
export class SessionEndedError extends Error {
  constructor() {
    super("No refresh token");
    this.name = "SessionEndedError";
  }
}

/**
 * Only these end the session: the refresh route said 401 (the core revoked the session, it
 * expired, or the token is unknown) or there is no refresh token at all. A network error, a
 * timeout, a 5xx, a 429 or a 403 is the server having a bad moment: keep the session and try again.
 */
export function isDefinitiveRefreshFailure(error: unknown): boolean {
  return error instanceof SessionEndedError || apiErrorStatus(error) === 401;
}

export type RefreshedTokens = {
  accessToken: string;
  /** Absent when the core answered a grace-window replay, or another tab already refreshed. */
  refreshToken?: string;
  /** Another tab refreshed while this one waited for the lock: no request was made. */
  fromOtherTab?: boolean;
};

export type CrossTabRefreshDeps = {
  readAccessToken: () => string | undefined;
  readRefreshToken: () => string | undefined;
  /** POST /auth/admins/refresh. */
  callRefresh: (refreshToken: string) => Promise<{ accessToken?: string; refreshToken?: string }>;
  /** Stores the result; a missing refresh token keeps the cookie that is there. */
  save: (tokens: { accessToken: string; refreshToken?: string }) => void;
  /** Runs the network part under the cross-tab lock. */
  lock: <T>(fn: () => Promise<T>) => Promise<T>;
  /** Told after a refresh this tab made (to broadcast it). */
  onRefreshed?: (tokens: RefreshedTokens) => void;
  now?: () => number;
};

/**
 * The refresh every tab shares: one in flight per tab (the queue), one across tabs (the lock).
 * Inside the lock the cookies are read again: if the refresh token, or the access token, changed
 * since this tab decided to refresh, another tab already did it and this one just uses the
 * cookies, without spending the refresh token a second time.
 */
export function createCrossTabRefresh(deps: CrossTabRefreshDeps) {
  const now = deps.now ?? (() => Date.now());
  return createRefreshQueue<RefreshedTokens>(async () => {
    const seenRefresh = deps.readRefreshToken();
    const seenAccess = deps.readAccessToken();
    return deps.lock(async () => {
      const refreshToken = deps.readRefreshToken();
      if (!refreshToken) throw new SessionEndedError();

      const access = deps.readAccessToken();
      const changedElsewhere = refreshToken !== seenRefresh || (!!access && access !== seenAccess);
      const exp = tokenExpiryMs(access);
      if (changedElsewhere && access && (exp === null || exp - now() > 30_000)) {
        return { accessToken: access, fromOtherTab: true };
      }

      const result = await deps.callRefresh(refreshToken);
      if (!result?.accessToken) throw new Error("The refresh answered without an access token");
      const tokens: RefreshedTokens = { accessToken: result.accessToken, refreshToken: result.refreshToken };
      deps.save(tokens);
      deps.onRefreshed?.(tokens);
      return tokens;
    });
  });
}

// ── Tab messages ───────────────────────────────────────────────────────────

export type SignOutReason = "expired" | "revoked" | "signed-out";
export type SessionMessage = { type: "refreshed" } | { type: "signed-out"; reason: SignOutReason };

/** A BroadcastChannel when the browser has one; posting and listening are no-ops otherwise. */
export function createSessionChannel(name = SESSION_CHANNEL_NAME) {
  let channel: BroadcastChannel | null = null;
  try {
    if (typeof BroadcastChannel !== "undefined") {
      channel = new BroadcastChannel(name);
      // Node (tests, server rendering) would otherwise keep the process alive for it.
      (channel as BroadcastChannel & { unref?: () => void }).unref?.();
    }
  } catch {
    channel = null;
  }
  return {
    post(message: SessionMessage) {
      try {
        channel?.postMessage(message);
      } catch {
        // A closed channel: the other tabs still see the cookies on their next request.
      }
    },
    subscribe(listener: (message: SessionMessage) => void) {
      if (!channel) return () => undefined;
      const handler = (event: MessageEvent) => {
        const data = event.data as SessionMessage | undefined;
        if (data && (data.type === "refreshed" || data.type === "signed-out")) listener(data);
      };
      channel.addEventListener("message", handler);
      return () => channel?.removeEventListener("message", handler);
    },
  };
}

// ── Proactive refresh ──────────────────────────────────────────────────────

export type KeeperRefreshResult = { ok: true } | { ok: false; definitive: boolean };

export type SessionKeeperDeps = {
  readAccessToken: () => string | undefined;
  readRefreshToken: () => string | undefined;
  /** Refreshes through the shared queue; says whether it worked and whether a failure ended the session. */
  refresh: () => Promise<KeeperRefreshResult>;
  isVisible?: () => boolean;
  /** Refresh this long before the access token expires. */
  leadMs?: number;
  /** Up to this much earlier again, different per tab, so tabs do not all fire at once. */
  jitterMs?: number;
  /** Waits after a failed refresh that did not end the session. */
  backoffMs?: number[];
  now?: () => number;
  random?: () => number;
};

/**
 * Refreshes about a minute before the access token expires, so requests (and the live socket)
 * rarely meet an expired token at all. Runs only while the tab is visible; a tab coming back
 * checks at once. After a failure that does not end the session (offline, a 5xx, a 429), it
 * tries again with backoff.
 */
const MIN_GAP_MS = 10_000;

export function createSessionKeeper(deps: SessionKeeperDeps) {
  const now = deps.now ?? (() => Date.now());
  const random = deps.random ?? Math.random;
  const isVisible = deps.isVisible ?? (() => typeof document === "undefined" || document.visibilityState !== "hidden");
  const leadMs = deps.leadMs ?? 60_000;
  const jitter = Math.floor(random() * (deps.jitterMs ?? 10_000));
  const backoff = deps.backoffMs ?? [2_000, 5_000, 10_000, 30_000, 60_000];

  let timer: ReturnType<typeof setTimeout> | null = null;
  let failures = 0;
  let stopped = true;
  let running = false;

  const clear = () => {
    if (timer) clearTimeout(timer);
    timer = null;
  };

  /** Milliseconds until this tab should refresh, or null when there is no session to keep. */
  function dueIn(): number | null {
    if (!deps.readRefreshToken()) return null;
    const exp = tokenExpiryMs(deps.readAccessToken());
    if (exp === null) return 0;
    return Math.max(0, exp - now() - leadMs - jitter);
  }

  function schedule(delay?: number) {
    clear();
    if (stopped) return;
    const wait = delay ?? dueIn();
    if (wait === null) return;
    timer = setTimeout(() => void tick(), wait);
  }

  /** After a refresh: from the new expiry, but never sooner than `MIN_GAP_MS`, so nothing can spin. */
  function scheduleAfterRefresh() {
    const due = dueIn();
    if (due !== null) schedule(Math.max(due, MIN_GAP_MS));
    else clear();
  }

  function nextBackoff() {
    const wait = backoff[Math.min(failures, backoff.length - 1)];
    failures += 1;
    return wait;
  }

  async function tick() {
    timer = null;
    if (stopped || running || !isVisible()) return; // A hidden tab waits for onVisible().
    const due = dueIn();
    if (due === null) return;
    if (due > 0 && failures === 0) return schedule(due);

    running = true;
    const result = await deps.refresh().catch((): KeeperRefreshResult => ({ ok: false, definitive: false }));
    running = false;
    if (stopped) return;
    if (result.ok) {
      failures = 0;
      scheduleAfterRefresh();
    } else if (!result.definitive) {
      schedule(nextBackoff());
    }
  }

  return {
    start() {
      stopped = false;
      schedule();
    },
    stop() {
      stopped = true;
      clear();
    },
    /** The tab became visible: refresh now if due (after a short random pause), else schedule. */
    onVisible() {
      if (stopped) return;
      if (dueIn() === 0 || failures > 0) {
        clear();
        timer = setTimeout(() => void tick(), Math.floor(random() * 500));
      } else schedule();
    },
    /** The tokens changed (this tab or another refreshed): schedule from the new expiry. */
    reschedule() {
      failures = 0;
      if (!stopped && !running) scheduleAfterRefresh();
    },
    /** A request's refresh failed without ending the session: try again with backoff. */
    retrySoon() {
      if (stopped || running) return;
      schedule(nextBackoff());
    },
    get scheduled() {
      return timer !== null;
    },
  };
}
