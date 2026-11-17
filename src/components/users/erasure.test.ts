import { blockerDetail, erasureChecklist, erasureConfirmMatches, erasureConfirmTarget } from "./erasure";

describe("erasure checklist", () => {
  it("marks every known check clear when the API sends no blockers", () => {
    const list = erasureChecklist([]);
    expect(list).toHaveLength(6);
    expect(list.every((c) => c.ok)).toBe(true);
    expect(list.map((c) => c.code)).toEqual([
      "OPEN_ORDERS",
      "RIDER_MID_TRIP",
      "WALLET_BALANCE",
      "PENDING_WITHDRAWALS",
      "OWNS_BUSINESS",
      "OWNS_TEAM",
    ]);
  });

  it("maps blockers onto their checks with the API's sentence, and shows the balance in naira", () => {
    const list = erasureChecklist([
      { code: "OPEN_ORDERS", count: 2, message: "2 open orders must finish or be cancelled" },
      { code: "WALLET_BALANCE", count: 150000, message: "" },
    ]);
    const open = list.find((c) => c.code === "OPEN_ORDERS");
    expect(open).toMatchObject({ ok: false, detail: "2 open orders must finish or be cancelled" });
    const wallet = list.find((c) => c.code === "WALLET_BALANCE");
    expect(wallet?.ok).toBe(false);
    expect(wallet?.detail).toContain("1,500");
    expect(list.find((c) => c.code === "OWNS_TEAM")?.ok).toBe(true);
  });

  it("keeps a blocker code the console does not know yet", () => {
    const list = erasureChecklist([{ code: "ACTIVE_DISPUTE", count: 1, message: "An open dispute must close first" }]);
    expect(list).toHaveLength(7);
    expect(list[6]).toMatchObject({ code: "ACTIVE_DISPUTE", ok: false, label: "An open dispute must close first" });
  });

  it("falls back to a count when the API sent no sentence", () => {
    expect(blockerDetail({ code: "OWNS_BUSINESS", count: 1, message: "" })).toBe("1 in the way");
  });
});

describe("erasure confirmation", () => {
  it("asks for the phone first, then the email", () => {
    expect(erasureConfirmTarget({ phone: "2348011111111", email: "a@b.c" })).toEqual({
      label: "phone number",
      value: "2348011111111",
    });
    expect(erasureConfirmTarget({ email: "a@b.c" })).toEqual({ label: "email address", value: "a@b.c" });
    expect(erasureConfirmTarget({})).toBeNull();
  });

  it("accepts the phone however it is typed, and the email in any case", () => {
    const phone = { label: "phone number", value: "2348011111111" };
    expect(erasureConfirmMatches("+234 801 111 1111", phone)).toBe(true);
    expect(erasureConfirmMatches("08011111111", phone)).toBe(true);
    expect(erasureConfirmMatches("2348011111111", phone)).toBe(true);
    expect(erasureConfirmMatches("08011111112", phone)).toBe(false);
    expect(erasureConfirmMatches("", phone)).toBe(false);
    const email = { label: "email address", value: "Ada@Example.com" };
    expect(erasureConfirmMatches(" ada@example.com ", email)).toBe(true);
    expect(erasureConfirmMatches("ada@example.co", email)).toBe(false);
    expect(erasureConfirmMatches("anything", null)).toBe(false);
  });
});
