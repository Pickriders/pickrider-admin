import { redirect } from "next/navigation";

/** Old type tabs (?order-type=batch delivery) map onto the list's type filter. */
const TYPE_BY_SLUG: Record<string, string> = {
  single: "SINGLE",
  "batch delivery": "BATCH",
  "bulk pickup": "BULK",
};

export default function MoreOrderTypesRedirect({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const slug = searchParams?.["order-type"];
  const type = TYPE_BY_SLUG[String(Array.isArray(slug) ? slug[0] : (slug ?? "")).toLowerCase()];
  redirect(type ? `/orders?tab=all&type=${type}` : "/orders?tab=all");
}
