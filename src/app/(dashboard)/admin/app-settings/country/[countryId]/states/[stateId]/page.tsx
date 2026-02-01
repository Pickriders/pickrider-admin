import { notFound } from "next/navigation";
import { StateConfig } from "./StateConfig";

const StateDetails = ({ params }: { params: { countryId: string; stateId: string } }) => {
  if (!params.countryId || !params.stateId) {
    notFound();
  }

  return (
    <div>
      <StateConfig countryId={params.countryId} stateId={params.stateId} />
    </div>
  );
};
export default StateDetails;
