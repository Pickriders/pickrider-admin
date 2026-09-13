import { redirect } from "next/navigation";

/** Old status tabs (?order-status=completed) map onto the list's status filter. */
const STATUS_BY_SLUG: Record<string, string> = {
  completed: "COMPLETED",
  cancelled: "CANCELLED",
  ongoing: "ON_GOING",
  pending: "INITIATED",
};

export default function MoreOrdersRedirect({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const slug = searchParams?.["order-status"];
  const status = STATUS_BY_SLUG[String(Array.isArray(slug) ? slug[0] : (slug ?? "")).toLowerCase()];
  redirect(status ? `/orders?tab=all&status=${status}` : "/orders?tab=all");
}
