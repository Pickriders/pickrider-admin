import { currentStepUp, requestStepUp, resetStepUpForTests, settleStepUp, subscribeStepUp } from "./step-up";

describe("step-up store", () => {
  beforeEach(() => resetStepUpForTests());

  it("publishes one prompt for concurrent requests and hands every waiter the same code", async () => {
    const seen: unknown[] = [];
    subscribeStepUp((request) => seen.push(request));
    const a = requestStepUp({ mfaEnabled: true, header: "X-MFA-Code", freshForMinutes: 10 });
    const b = requestStepUp({ mfaEnabled: true }, "Erase account");

    expect(currentStepUp()?.details.header).toBe("X-MFA-Code");
    expect(currentStepUp()?.purpose).toBe("Erase account");
    settleStepUp("123456");
    await expect(a).resolves.toBe("123456");
    await expect(b).resolves.toBe("123456");
    expect(currentStepUp()).toBeNull();
    // null (nothing), the prompt, the prompt with its purpose, then cleared.
    expect(seen.map((r) => (r ? "open" : "closed"))).toEqual(["closed", "open", "open", "closed"]);
  });

  it("resolves null when the admin cancels", async () => {
    const pending = requestStepUp({ mfaEnabled: false });
    settleStepUp(null);
    await expect(pending).resolves.toBeNull();
  });

  it("a new request after settling opens a fresh prompt", async () => {
    const first = requestStepUp({ mfaEnabled: true });
    settleStepUp("111111");
    await first;
    const second = requestStepUp({ mfaEnabled: true });
    expect(currentStepUp()).not.toBeNull();
    settleStepUp("222222");
    await expect(second).resolves.toBe("222222");
  });
});
