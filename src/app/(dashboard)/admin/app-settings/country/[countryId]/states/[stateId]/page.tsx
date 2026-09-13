import { redirect } from "next/navigation";

/** Moved into the admin hub; the state opens in a drawer. */
export default function StatePage({ params }: { params: { countryId: string; stateId: string } }) {
  redirect(`/admin?tab=settings&country=${encodeURIComponent(params.countryId)}&state=${encodeURIComponent(params.stateId)}`);
}
