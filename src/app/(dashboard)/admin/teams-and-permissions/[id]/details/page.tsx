import { redirect } from "next/navigation";

/** Moved into the admin hub; the member opens in a drawer. */
export default function TeamMemberDetailsPage({ params }: { params: { id: string } }) {
  redirect(`/admin?tab=team&member=${encodeURIComponent(params.id)}`);
}
