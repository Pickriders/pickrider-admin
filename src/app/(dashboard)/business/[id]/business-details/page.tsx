import { BusinessDetail } from "./BusinessDetail";

export default function BusinessDetailsPage({ params }: { params: { id: string } }) {
  return <BusinessDetail businessId={params.id} />;
}
