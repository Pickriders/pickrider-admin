import { FLOW_META, chartPoints, feeShare, feeTrend, flowMeta, keptSplit, ratePercent } from "./provider-fees-lib";

describe("provider fees helpers", () => {
  it("knows every flow the API returns, in the API's order", () => {
    expect(FLOW_META.map((meta) => meta.key)).toEqual([
      "WALLET_DEPOSIT",
      "ORDER_CARD_PAYMENT",
      "WEB_ORDER_PAYMENT",
      "WITHDRAWAL",
      "PLATFORM_PAYOUT",
      "REFUND",
    ]);
    expect(flowMeta("WITHDRAWAL")).toMatchObject({ label: "Withdrawals", direction: "out" });
    expect(flowMeta("SOMETHING_NEW").label).toBe("SOMETHING_NEW");
  });

  it("reads a fee rise as bad and a fall as good", () => {
    expect(feeTrend(12_000, 10_000)).toEqual({ value: 20, tone: "danger" });
    expect(feeTrend(8_000, 10_000)).toEqual({ value: -20, tone: "success" });
    expect(feeTrend(0, 0)).toEqual({ value: 0, tone: "neutral" });
    expect(feeTrend(5_000, 0)).toBeNull();
  });

  it("works out each flow's share of the fees", () => {
    expect(feeShare({ fees: 15_000 }, 29_500)).toBe(51);
    expect(feeShare({ fees: 0 }, 0)).toBe(0);
  });

  it("splits money in into kept and fees, never hiding a tiny fee", () => {
    expect(keptSplit(1_500_000, 19_500)).toEqual({ kept: 98.5, fees: 1.5 });
    expect(keptSplit(1_000_000, 100_000)).toEqual({ kept: 90, fees: 10 });
    expect(keptSplit(1_000_000, 0)).toEqual({ kept: 100, fees: 0 });
    expect(keptSplit(0, 0)).toEqual({ kept: 0, fees: 0 });
  });

  it("flattens the series so each flow is its own bar", () => {
    const rows = chartPoints([
      { bucket: "2026-09-01T23:00:00.000Z", fees: 10_000, gross: 800_000, feeCount: 3, byFlow: { WITHDRAWAL: 5_000, PLATFORM_PAYOUT: 5_000 } },
    ]);
    expect(rows[0]).toMatchObject({ bucket: "2026-09-01T23:00:00.000Z", fees: 10_000, WITHDRAWAL: 5_000, PLATFORM_PAYOUT: 5_000, WALLET_DEPOSIT: 0 });
    expect(chartPoints(undefined)).toEqual([]);
  });

  it("formats rates to two decimals", () => {
    expect(ratePercent(1.5)).toBe("1.50%");
    expect(ratePercent(null)).toBe("0.00%");
  });
});
