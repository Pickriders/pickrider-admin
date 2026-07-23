import { notFound } from "next/navigation";
import { CourierDetail } from "./CourierDetail";

const DetailsPage = ({ params }: { params: { id: string } }) => {
  if (!params.id) notFound();
  return <CourierDetail id={params.id} />;
};

export default DetailsPage;
