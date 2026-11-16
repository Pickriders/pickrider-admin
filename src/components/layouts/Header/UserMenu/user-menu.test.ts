import { ACCOUNT_LINKS } from "./index";

jest.mock("@/lib/admin/hooks", () => ({ useMe: () => ({ data: undefined, isLoading: false }) }));
jest.mock("@/hooks", () => ({ useQueryModal: () => ({ setParam: jest.fn() }) }));

describe("user menu", () => {
  it("points Profile and Security at the Settings tabs", () => {
    expect(ACCOUNT_LINKS.map(({ label, href }) => ({ label, href }))).toEqual([
      { label: "Profile", href: "/dashboard/settings" },
      { label: "Security", href: "/dashboard/settings?tab=security" },
    ]);
  });
});
