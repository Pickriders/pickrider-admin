import { notFound } from "next/navigation";
import { CustomerDetail } from "./CustomerDetail";

const CustomerDetailPage = ({ params }: { params: { id: string } }) => {
  if (!params.id) notFound();
  return <CustomerDetail id={params.id} />;
};

export default CustomerDetailPage;
