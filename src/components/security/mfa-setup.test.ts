import { groupSecret, otpauthAccount, recoveryCodesText } from "./mfa-setup";

describe("authenticator setup helpers", () => {
  it("groups the base32 secret in fours for manual entry", () => {
    expect(groupSecret("JBSWY3DPEHPK3PXP")).toBe("JBSW Y3DP EHPK 3PXP");
    expect(groupSecret("JBSWY3DPEHPK3PXPAB")).toBe("JBSW Y3DP EHPK 3PXP AB");
  });

  it("reads the account out of an otpauth URI", () => {
    expect(otpauthAccount("otpauth://totp/Pickriders%20Admin:ops@pickriders.com?secret=ABC&issuer=Pickriders%20Admin")).toBe("ops@pickriders.com");
    expect(otpauthAccount("otpauth://totp/ops@pickriders.com?secret=ABC")).toBe("ops@pickriders.com");
    expect(otpauthAccount("not a uri")).toBeNull();
  });

  it("writes one recovery code per line in the download", () => {
    const text = recoveryCodesText(["AAAAA-BBBBB", "CCCCC-DDDDD"]);
    expect(text).toContain("AAAAA-BBBBB\nCCCCC-DDDDD");
    expect(text.startsWith("Pickriders Admin recovery codes")).toBe(true);
  });
});
