import { ratingDisplay } from "./lib";

describe("rider rating on the leaderboard", () => {
  it("shows the average to one decimal with the review count", () => {
    expect(ratingDisplay({ average: 4.8333, count: 12 })).toEqual({ average: "4.8", reviews: "12", caption: "4.8 out of 5 from 12 ratings" });
    expect(ratingDisplay({ average: 5, count: 1 })).toEqual({ average: "5.0", reviews: "1", caption: "5.0 out of 5 from 1 rating" });
    expect(ratingDisplay({ average: 3.95, count: 1200 })).toEqual({ average: "4.0", reviews: "1,200", caption: "4.0 out of 5 from 1,200 ratings" });
  });

  it("is empty when the API does not send a rating yet", () => {
    expect(ratingDisplay(undefined)).toBeNull();
    expect(ratingDisplay(null)).toBeNull();
  });

  it("is empty when the rider has no reviews, whatever the average says", () => {
    expect(ratingDisplay({ average: 0, count: 0 })).toBeNull();
    expect(ratingDisplay({ average: null, count: 0 })).toBeNull();
    expect(ratingDisplay({ average: null, count: 3 })).toBeNull();
    expect(ratingDisplay({ average: Number.NaN, count: 3 })).toBeNull();
  });
});
