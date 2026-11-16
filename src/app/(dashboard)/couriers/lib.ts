import { count } from "@/lib/admin/format";
import type { RatingSummaryDto } from "@/services";

/**
 * `rating { average, count }` on a rider row: the core's RatingSummaryDto without the star
 * distribution. Absent until the API sends it, null before any review.
 */
export type RiderRating = Partial<Pick<RatingSummaryDto, "average" | "count">> | { average?: number | null; count?: number | null } | null | undefined;

/**
 * What the leaderboard shows for a rider's rating: the average to one decimal, the number of
 * reviews behind it and a caption for the title. Null when the API sent nothing or the rider has
 * no reviews yet, so the row can say "No ratings" instead of a misleading 0.0.
 */
export function ratingDisplay(rating: RiderRating): { average: string; reviews: string; caption: string } | null {
  if (!rating) return null;
  const reviews = rating.count ?? 0;
  const average = rating.average;
  if (reviews <= 0 || typeof average !== "number" || Number.isNaN(average)) return null;
  const shown = average.toFixed(1);
  return { average: shown, reviews: count(reviews), caption: `${shown} out of 5 from ${count(reviews)} ${reviews === 1 ? "rating" : "ratings"}` };
}
