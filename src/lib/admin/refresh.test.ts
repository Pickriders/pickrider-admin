import { createRefreshQueue } from "./refresh";

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
