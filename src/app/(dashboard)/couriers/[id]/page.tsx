import { redirect } from "next/navigation";

/** Other pages link to /couriers/[id]; the rider record lives under /details. */
export default function CourierPage({ params }: { params: { id: string } }) {
  redirect(`/couriers/${params.id}/details`);
}
