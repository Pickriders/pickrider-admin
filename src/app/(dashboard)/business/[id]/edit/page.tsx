import { redirect } from "next/navigation";

/** Old route; editing lives on the business detail page's settings tab now. */
export default function BusinessEditPage({ params }: { params: { id: string } }) {
  redirect(`/business/${params.id}/business-details?tab=settings`);
}
