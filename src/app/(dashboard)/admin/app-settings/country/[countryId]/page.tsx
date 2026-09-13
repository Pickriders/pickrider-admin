import { redirect } from "next/navigation";

/** Moved into the admin hub. */
export default function CountryPage({ params }: { params: { countryId: string } }) {
  redirect(`/admin?tab=settings&country=${encodeURIComponent(params.countryId)}`);
}
