import { redirect } from "next/navigation";

/** Old route; the business detail page carries this as a tab now. */
export default function BusinessVehiclesPage({ params }: { params: { id: string } }) {
  redirect(`/business/${params.id}/business-details?tab=vehicles`);
}
