import { AxiosError, AxiosHeaders } from "axios";

import {
  audienceCounts,
  formatSampleVariables,
  groupTemplates,
  hasDarkStyles,
  matchesTemplate,
  missingVariables,
  parseSampleVariables,
  previewDocument,
  summariseQueued,
  templateTitle,
  testSendErrorMessage,
  testSendMessage,
} from "./emails";

const t = (key: string, category: string, audience: string, extra: Partial<{ description: string; trigger: string; subject: string }> = {}) => ({
  key,
  name: `pickriders-${key}`,
  category,
  audience,
  description: "",
  trigger: "",
  subject: "",
  ...extra,
});

const REGISTRY = [
  t("product-news", "MARKETING", "EVERYONE", { description: "What's new" }),
  t("order-receipt", "ORDERS", "CUSTOMER", { description: "Receipt after a paid order", trigger: "A paid customer-app order is completed" }),
  t("verification-code", "ACCOUNT", "EVERYONE", { subject: "Your Pickriders verification code" }),
  t("withdrawal-paid", "PAYMENTS", "RIDER"),
  t("order-cancelled", "ORDERS", "CUSTOMER"),
  t("mystery", "SOMETHING_NEW", "STAFF"),
];

describe("template gallery", () => {
  it("groups by category in the registry's order, unknown categories last, registry order kept inside", () => {
    const groups = groupTemplates(REGISTRY);
    expect(groups.map((g) => g.category)).toEqual(["ACCOUNT", "ORDERS", "PAYMENTS", "MARKETING", "SOMETHING_NEW"]);
    expect(groups[1]).toEqual({ category: "ORDERS", label: "Orders", templates: [REGISTRY[1], REGISTRY[4]] });
    expect(groups[4].label).toBe("SOMETHING_NEW");
  });

  it("filters by audience and by every search word across name, key, subject, description and trigger", () => {
    expect(groupTemplates(REGISTRY, { audience: "CUSTOMER" }).flatMap((g) => g.templates.map((x) => x.key))).toEqual(["order-receipt", "order-cancelled"]);
    expect(groupTemplates(REGISTRY, { search: "PAID order" }).flatMap((g) => g.templates.map((x) => x.key))).toEqual(["order-receipt"]);
    expect(groupTemplates(REGISTRY, { search: "verification code" }).flatMap((g) => g.templates.map((x) => x.key))).toEqual(["verification-code"]);
    expect(groupTemplates(REGISTRY, { search: "nothing like this" })).toEqual([]);
    expect(groupTemplates(undefined)).toEqual([]);
  });

  it("matches everything on an empty search", () => {
    expect(matchesTemplate(REGISTRY[0], "")).toBe(true);
    expect(matchesTemplate(REGISTRY[0], "   ")).toBe(true);
    expect(matchesTemplate(REGISTRY[0], null)).toBe(true);
  });

  it("counts templates per audience for the chips", () => {
    expect(audienceCounts(REGISTRY)).toEqual({ EVERYONE: 2, CUSTOMER: 2, RIDER: 1, STAFF: 1 });
    expect(audienceCounts(null)).toEqual({});
  });

  it("titles a registry key", () => {
    expect(templateTitle("order-receipt")).toBe("Order receipt");
    expect(templateTitle("developer_low-balance")).toBe("Developer low balance");
    expect(templateTitle("")).toBe("");
    expect(templateTitle(undefined)).toBe("");
  });
});

describe("previewDocument", () => {
  const html =
    '<!DOCTYPE html><html><head><meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark">' +
    "<style>:root{color-scheme:light dark}@media screen and (max-width:620px){.pr-x{display:block}}@media (prefers-color-scheme: dark){.pr-card{background:#111}}" +
    "@media screen and (prefers-color-scheme:dark){.pr-text{color:#eee}}</style></head><body><a href=\"https://pickriders.com\">Hi</a></body></html>";

  it("dark: the template's dark rules always apply and the scheme is pinned dark", () => {
    const doc = previewDocument(html, "dark");
    expect(doc).not.toMatch(/prefers-color-scheme/);
    expect(doc).toContain("@media (min-width: 0px){.pr-card{background:#111}}");
    expect(doc).toContain("@media screen and (min-width: 0px){.pr-text{color:#eee}}");
    expect(doc).toContain('<meta name="color-scheme" content="dark">');
    expect(doc).toContain('<meta name="supported-color-schemes" content="dark">');
    expect(doc).toContain(":root{color-scheme:dark !important}");
  });

  it("light: the dark rules never apply, whatever the viewer's OS is set to", () => {
    const doc = previewDocument(html, "light");
    expect(doc).toContain("@media (min-width: 100000px){.pr-card{background:#111}}");
    expect(doc).toContain('<meta name="color-scheme" content="light">');
    expect(doc).toContain(":root{color-scheme:light !important}");
  });

  it("leaves the responsive rules alone and opens links in a new tab", () => {
    const doc = previewDocument(html, "light");
    expect(doc).toContain("@media screen and (max-width:620px)");
    expect(doc).toMatch(/<base target="_blank"><style>[^<]*<\/style><\/head>/);
  });

  it("injects into a fragment without a head", () => {
    expect(previewDocument("<body><p>x</p></body>", "dark").startsWith('<base target="_blank">')).toBe(true);
    expect(previewDocument("<p>x</p>", "light").startsWith('<base target="_blank">')).toBe(true);
  });

  it("knows whether a template ships dark styles", () => {
    expect(hasDarkStyles(html)).toBe(true);
    expect(hasDarkStyles("<p>plain</p>")).toBe(false);
    expect(hasDarkStyles(undefined)).toBe(false);
  });
});

describe("sample data editor", () => {
  it("accepts a JSON object", () => {
    expect(parseSampleVariables(' { "name": "Ada", "total": 2500 } ')).toEqual({ ok: true, value: { name: "Ada", total: 2500 } });
    expect(parseSampleVariables("{}")).toEqual({ ok: true, value: {} });
  });

  it("explains empty input, broken JSON, and JSON that is not an object", () => {
    expect(parseSampleVariables("   ")).toMatchObject({ ok: false, error: expect.stringMatching(/JSON object/) });
    expect(parseSampleVariables("{ name: Ada }")).toMatchObject({ ok: false, error: expect.stringMatching(/^That is not valid JSON/) });
    expect(parseSampleVariables("[1, 2]")).toMatchObject({ ok: false, error: expect.stringMatching(/must be a JSON object/) });
    expect(parseSampleVariables("null")).toMatchObject({ ok: false, error: expect.stringMatching(/must be a JSON object/) });
    expect(parseSampleVariables('"text"')).toMatchObject({ ok: false, error: expect.stringMatching(/must be a JSON object/) });
  });

  it("refuses an oversized paste", () => {
    const big = JSON.stringify({ blob: "x".repeat(20_001) });
    expect(parseSampleVariables(big)).toMatchObject({ ok: false, error: expect.stringMatching(/too much/) });
  });

  it("pretty-prints for the editor and lists variables the data leaves out (by top-level name)", () => {
    expect(formatSampleVariables({ a: 1 })).toBe('{\n  "a": 1\n}');
    expect(formatSampleVariables(undefined)).toBe("{}");
    expect(missingVariables(["name", "order.number", "total"], { name: "Ada", order: {} })).toEqual(["total"]);
    expect(missingVariables(undefined, {})).toEqual([]);
  });
});

describe("test sends", () => {
  const queued = [
    { templateKey: "order-receipt", recipient: "a@x.com", status: "queued" },
    { templateKey: "welcome", recipient: "a@x.com", status: "sent" },
    { templateKey: "sign-in", recipient: "a@x.com", status: "failed" },
    { templateKey: "launch", recipient: "a@x.com", status: "duplicate" },
    { templateKey: "odd", recipient: "a@x.com", status: "unknown" },
  ];

  it("counts outcomes, ignoring ones it does not know", () => {
    expect(summariseQueued(queued)).toEqual({ queued: 1, sent: 1, failed: 1, duplicate: 1 });
    expect(summariseQueued(undefined)).toEqual({ queued: 0, sent: 0, failed: 0, duplicate: 0 });
  });

  it("says what went where", () => {
    expect(testSendMessage({ count: 1, queued: [queued[0]] }, ["a@x.com"])).toBe("Test email on its way to a@x.com");
    expect(testSendMessage({ count: 4, queued: queued.slice(0, 4) }, ["a@x.com", "b@y.com"])).toBe(
      "2 of 4 test emails on their way to 2 addresses (1 failed, 1 already sent)",
    );
  });

  const axiosError = (status: number, message: string) => {
    const error = new AxiosError("Request failed");
    error.response = { status, data: { message }, statusText: "", headers: {}, config: { headers: new AxiosHeaders() } };
    return error;
  };

  it("turns the per-admin rate limit into advice and passes other errors through", () => {
    expect(testSendErrorMessage(axiosError(429, "ThrottlerException: Too Many Requests"))).toBe("That's a lot of test emails in a minute. Wait a minute, then send again.");
    expect(testSendErrorMessage(axiosError(404, "Unknown email template"))).toBe("Unknown email template");
  });
});
