import { notFound } from "next/navigation";
import { CourierEdit } from "./CourierEdit";

const EditPage = ({ params }: { params: { id: string } }) => {
  if (!params.id) {
    notFound();
  }
  return <CourierEdit id={params.id} />;
};

export default EditPage;
