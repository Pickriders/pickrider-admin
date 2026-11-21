import {
  createCrossTabRefresh,
  createRefreshQueue,
  createSessionKeeper,
  isDefinitiveRefreshFailure,
  type LockManagerLike,
  REFRESH_LOCK_NAME,
  SessionEndedError,
  tokenExpiryMs,
  withCrossTabLock,
} from "./refresh";

describe("createRefreshQueue", () => {
  it("shares one in-flight refresh between concurrent callers", async () => {
    let resolve!: (value: string) => void;
    const refresh = jest.fn(() => new Promise<string>((r) => (resolve = r)));
    const queue = createRefreshQueue(refresh);

    const a = queue.run();
    const b = queue.run();
    const c = queue.run();
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(queue.pending).toBe(true);

    resolve("token-1");
    const results = await Promise.all([a, b, c]);
    expect(results).toEqual([
      { ok: true, value: "token-1" },
      { ok: true, value: "token-1" },
      { ok: true, value: "token-1" },
    ]);
    expect(queue.pending).toBe(false);
  });

  it("starts a new refresh once the previous one settled", async () => {
    const refresh = jest.fn().mockResolvedValueOnce("one").mockResolvedValueOnce("two");
    const queue = createRefreshQueue(refresh);
    await expect(queue.run()).resolves.toEqual({ ok: true, value: "one" });
    await expect(queue.run()).resolves.toEqual({ ok: true, value: "two" });
    expect(refresh).toHaveBeenCalledTimes(2);
  });

  it("reports a failure to every waiter without throwing, then clears", async () => {
    const error = new Error("revoked");
    const refresh = jest.fn().mockRejectedValue(error);
    const queue = createRefreshQueue(refresh);
    const results = await Promise.all([queue.run(), queue.run()]);
    expect(results).toEqual([
      { ok: false, error },
      { ok: false, error },
    ]);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(queue.pending).toBe(false);
  });
});

/** A JWT-shaped token whose payload carries `exp` (seconds); the signature is irrelevant here. */
function jwt(expMs: number, id = "t") {
  const payload = Buffer.from(JSON.stringify({ exp: Math.floor(expMs / 1000), id })).toString("base64url");
  return `h.${payload}.s`;
}

/** navigator.locks as the browser gives it: one holder at a time, the rest queue in order. */
function fakeLocks(): LockManagerLike & { request: jest.Mock } {
  let chain: Promise<unknown> = Promise.resolve();
  const request = jest.fn((_name: string, callback: () => Promise<unknown>) => {
    const run = chain.then(() => callback());
    chain = run.catch(() => undefined);
    return run;
  });
  return { request } as LockManagerLike & { request: jest.Mock };
}

function memoryStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
    store,
  };
}

describe("tokenExpiryMs", () => {
  it("reads exp from a JWT and ignores anything that is not one", () => {
    expect(tokenExpiryMs(jwt(1_800_000_000_000))).toBe(1_800_000_000_000);
    expect(tokenExpiryMs("not-a-jwt")).toBeNull();
    expect(tokenExpiryMs("a.!!!.c")).toBeNull();
    expect(tokenExpiryMs(undefined)).toBeNull();
  });
});

describe("isDefinitiveRefreshFailure", () => {
  const axiosError = (status?: number, code?: string) =>
    Object.assign(new Error("x"), {
      isAxiosError: true,
      response: status ? { status, data: { code } } : undefined,
    });

  it("is final only for a 401 from the refresh route or a missing refresh token", () => {
    expect(isDefinitiveRefreshFailure(axiosError(401, "SESSION_REVOKED"))).toBe(true);
    expect(isDefinitiveRefreshFailure(axiosError(401))).toBe(true);
    expect(isDefinitiveRefreshFailure(new SessionEndedError())).toBe(true);
  });

  it("keeps the session for network errors, timeouts, 5xx, 429, 403 and 428", () => {
    for (const error of [
      axiosError(),
      axiosError(500),
      axiosError(503),
      axiosError(429),
      axiosError(403),
      axiosError(428),
    ]) {
      expect(isDefinitiveRefreshFailure(error)).toBe(false);
    }
    expect(isDefinitiveRefreshFailure(new Error("timeout of 45000ms exceeded"))).toBe(false);
  });
});

describe("withCrossTabLock", () => {
  it("uses navigator.locks when there is one", async () => {
    const locks = fakeLocks();
    await expect(withCrossTabLock(REFRESH_LOCK_NAME, async () => 7, { locks })).resolves.toBe(7);
    expect(locks.request).toHaveBeenCalledWith("pr-admin-refresh", expect.any(Function));
  });

  it("falls back to a localStorage lock that lets one holder in at a time and frees itself", async () => {
    const storage = memoryStorage();
    let inside = 0;
    let maxInside = 0;
    const work = () =>
      withCrossTabLock(
        REFRESH_LOCK_NAME,
        async () => {
          inside += 1;
          maxInside = Math.max(maxInside, inside);
          await new Promise((r) => setTimeout(r, 40));
          inside -= 1;
          return "done";
        },
        { locks: null, storage },
      );
    await expect(Promise.all([work(), work()])).resolves.toEqual(["done", "done"]);
    expect(maxInside).toBe(1);
    expect(storage.store.size).toBe(0);
  });

  it("takes over a localStorage lock whose tab died holding it", async () => {
    const storage = memoryStorage();
    storage.setItem("@pickriders/lock:pr-admin-refresh", JSON.stringify({ owner: "dead", expiresAt: Date.now() - 1 }));
    await expect(withCrossTabLock(REFRESH_LOCK_NAME, async () => "ok", { locks: null, storage })).resolves.toBe("ok");
  });
});

describe("createCrossTabRefresh (two tabs, one browser)", () => {
  const NOW = 1_800_000_000_000;
  let jar: { access?: string; refresh?: string };

  function tab(locks: ReturnType<typeof fakeLocks>, callRefresh: jest.Mock) {
    return createCrossTabRefresh({
      readAccessToken: () => jar.access,
      readRefreshToken: () => jar.refresh,
      callRefresh,
      save: (tokens) => {
        jar.access = tokens.accessToken;
        if (tokens.refreshToken) jar.refresh = tokens.refreshToken;
      },
      lock: (fn) => withCrossTabLock(REFRESH_LOCK_NAME, fn, { locks }),
      now: () => NOW,
    });
  }

  beforeEach(() => {
    jar = { access: jwt(NOW - 1_000, "expired"), refresh: "R1" };
  });

  it("two tabs refreshing together spend the refresh token once; the second uses the first one's cookies", async () => {
    const locks = fakeLocks();
    const callRefresh = jest.fn(async () => ({ accessToken: jwt(NOW + 900_000, "fresh"), refreshToken: "R2" }));
    const a = tab(locks, callRefresh);
    const b = tab(locks, callRefresh);

    const [ra, rb] = await Promise.all([a.run(), b.run()]);
    expect(callRefresh).toHaveBeenCalledTimes(1);
    expect(callRefresh).toHaveBeenCalledWith("R1");
    expect(ra).toEqual({ ok: true, value: { accessToken: jwt(NOW + 900_000, "fresh"), refreshToken: "R2" } });
    expect(rb).toEqual({ ok: true, value: { accessToken: jwt(NOW + 900_000, "fresh"), fromOtherTab: true } });
    expect(jar.refresh).toBe("R2");
  });

  it("skips the request when the refresh cookie rotated while this tab waited for the lock", async () => {
    const locks = fakeLocks();
    const callRefresh = jest.fn();
    const queue = tab(locks, callRefresh);
    // Another tab holds the lock and rotates the cookies before letting go.
    let release!: () => void;
    const held = locks.request(REFRESH_LOCK_NAME, () => new Promise<void>((r) => (release = r)));
    const pending = queue.run();
    await new Promise((r) => setTimeout(r, 0)); // the other tab is inside the lock now
    jar = { access: jwt(NOW + 900_000, "other-tab"), refresh: "R2" };
    release();
    await held;
    await expect(pending).resolves.toEqual({
      ok: true,
      value: { accessToken: jwt(NOW + 900_000, "other-tab"), fromOtherTab: true },
    });
    expect(callRefresh).not.toHaveBeenCalled();
  });

  it("keeps the refresh cookie when the answer has no refreshToken (the core's grace-window answer)", async () => {
    const callRefresh = jest.fn(async () => ({ accessToken: jwt(NOW + 900_000, "grace") }));
    const onRefreshed = jest.fn();
    const queue = createCrossTabRefresh({
      readAccessToken: () => jar.access,
      readRefreshToken: () => jar.refresh,
      callRefresh,
      save: (tokens) => {
        jar.access = tokens.accessToken;
        if (tokens.refreshToken) jar.refresh = tokens.refreshToken;
      },
      lock: (fn) => fn(),
      onRefreshed,
    });
    await expect(queue.run()).resolves.toMatchObject({ ok: true, value: { accessToken: jwt(NOW + 900_000, "grace") } });
    expect(jar.refresh).toBe("R1");
    expect(onRefreshed).toHaveBeenCalledTimes(1);
  });

  it("fails with SessionEndedError when the refresh cookie is gone (signed out elsewhere)", async () => {
    jar = { access: undefined, refresh: undefined };
    const callRefresh = jest.fn();
    const outcome = await tab(fakeLocks(), callRefresh).run();
    expect(outcome.ok).toBe(false);
    expect(!outcome.ok && outcome.error).toBeInstanceOf(SessionEndedError);
    expect(callRefresh).not.toHaveBeenCalled();
  });
});

describe("createSessionKeeper", () => {
  const START = 1_800_000_000_000;
  let jar: { access?: string; refresh?: string };
  let visible: boolean;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(START);
    jar = { access: jwt(START + 15 * 60_000), refresh: "R1" };
    visible = true;
  });

  afterEach(() => jest.useRealTimers());

  const keeperWith = (refresh: jest.Mock, jitterFraction = 0) =>
    createSessionKeeper({
      readAccessToken: () => jar.access,
      readRefreshToken: () => jar.refresh,
      refresh,
      isVisible: () => visible,
      random: () => jitterFraction,
      jitterMs: 10_000,
    });

  it("refreshes about a minute before the access token expires, earlier by this tab's jitter", async () => {
    const refresh = jest.fn(async () => {
      jar.access = jwt(Date.now() + 15 * 60_000);
      return { ok: true as const };
    });
    const keeper = keeperWith(refresh, 0.5); // 5 seconds of jitter
    keeper.start();

    await jest.advanceTimersByTimeAsync(14 * 60_000 - 5_000 - 1);
    expect(refresh).not.toHaveBeenCalled();
    await jest.advanceTimersByTimeAsync(1);
    expect(refresh).toHaveBeenCalledTimes(1);
    // And again for the new token.
    expect(keeper.scheduled).toBe(true);
    keeper.stop();
  });

  it("waits while the tab is hidden and refreshes at once when it comes back", async () => {
    const refresh = jest.fn(async () => {
      jar.access = jwt(Date.now() + 15 * 60_000);
      return { ok: true as const };
    });
    const keeper = keeperWith(refresh);
    visible = false;
    keeper.start();
    await jest.advanceTimersByTimeAsync(20 * 60_000);
    expect(refresh).not.toHaveBeenCalled();

    visible = true;
    keeper.onVisible();
    await jest.advanceTimersByTimeAsync(500);
    expect(refresh).toHaveBeenCalledTimes(1);
    keeper.stop();
  });

  it("retries with backoff after a failure that keeps the session, and stops after a final one", async () => {
    jar.access = jwt(START - 1);
    const refresh = jest
      .fn()
      .mockResolvedValueOnce({ ok: false, definitive: false })
      .mockResolvedValueOnce({ ok: false, definitive: false })
      .mockResolvedValueOnce({ ok: false, definitive: true });
    const keeper = createSessionKeeper({
      readAccessToken: () => jar.access,
      readRefreshToken: () => jar.refresh,
      refresh,
      isVisible: () => true,
      random: () => 0,
      backoffMs: [1_000, 3_000],
    });
    keeper.start();
    await jest.advanceTimersByTimeAsync(0);
    expect(refresh).toHaveBeenCalledTimes(1);
    await jest.advanceTimersByTimeAsync(1_000);
    expect(refresh).toHaveBeenCalledTimes(2);
    await jest.advanceTimersByTimeAsync(3_000);
    expect(refresh).toHaveBeenCalledTimes(3);
    expect(keeper.scheduled).toBe(false);
    await jest.advanceTimersByTimeAsync(60 * 60_000);
    expect(refresh).toHaveBeenCalledTimes(3);
  });

  it("never spins: a refresh that leaves the token due waits before trying again", async () => {
    jar.access = jwt(START - 1);
    const refresh = jest.fn(async () => ({ ok: true as const }));
    const keeper = keeperWith(refresh);
    keeper.start();
    await jest.advanceTimersByTimeAsync(9_999);
    expect(refresh).toHaveBeenCalledTimes(1);
    await jest.advanceTimersByTimeAsync(1);
    expect(refresh).toHaveBeenCalledTimes(2);
    keeper.stop();
  });

  it("has nothing to do without a refresh token", async () => {
    jar.refresh = undefined;
    const refresh = jest.fn();
    const keeper = keeperWith(refresh);
    keeper.start();
    await jest.advanceTimersByTimeAsync(60 * 60_000);
    expect(refresh).not.toHaveBeenCalled();
  });
});
