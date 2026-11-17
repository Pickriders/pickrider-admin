import ChangePasswordPage from "../change-password/page";
import ProfilePage from "../profile/page";
import MySecurityPage from "../security/page";

const mockRedirect = jest.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT ${url}`);
});
jest.mock("next/navigation", () => ({ redirect: (url: string) => mockRedirect(url) }));

/** The old account pages are redirects now, so bookmarks and the account emails still work. */
describe("legacy account pages", () => {
  beforeEach(() => mockRedirect.mockClear());

  const target = (
    page: (props: { searchParams: Record<string, string | string[] | undefined> }) => unknown,
    searchParams = {},
  ) => {
    expect(() => page({ searchParams })).toThrow("NEXT_REDIRECT");
    return mockRedirect.mock.calls[0][0];
  };

  it("sends the profile page to the Profile tab", () => {
    expect(target(ProfilePage)).toBe("/dashboard/settings");
  });

  it("sends change password to the Password tab", () => {
    expect(target(ChangePasswordPage)).toBe("/dashboard/settings?tab=password");
  });

  it("sends my security to the Security tab and keeps the setup flag from the grace banner", () => {
    expect(target(MySecurityPage)).toBe("/dashboard/settings?tab=security");
    mockRedirect.mockClear();
    expect(target(MySecurityPage, { setup: "1" })).toBe("/dashboard/settings?tab=security&setup=1");
  });
});
