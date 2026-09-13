import { redirect } from "next/navigation";

/** Moved into the admin hub; the form opens in a drawer. */
export default function AddStatePage({ params }: { params: { countryId: string } }) {
  redirect(`/admin?tab=settings&country=${encodeURIComponent(params.countryId)}&add=state`);
}
