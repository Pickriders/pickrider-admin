import { livemodeQuery } from "./mode";

describe("livemodeQuery", () => {
  it("keeps test orders off the Orders page and lists only them on Test Orders", () => {
    expect(livemodeQuery("live")).toEqual({ livemode: "true" });
    expect(livemodeQuery("test")).toEqual({ livemode: "false" });
  });
});
