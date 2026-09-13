import { redirect } from "next/navigation";

/** Business KYB review is not part of this admin; send people to the business itself. */
export default function BusinessVerificationPage({ params }: { params: { id: string } }) {
  redirect(`/business/${params.id}/business-details`);
}
