import { UI } from "@/components/common";
import { BusinessTable } from "./BusinessTable";
import { SVG } from "@/components/svg";

const BusinessManagement = () => {
  return (
    <UI.Container padding={"3rem 2rem 0 2rem"}>
      <UI.Container display="flex" justifyContent="space-between">
        <UI.Heading variant="h2">Business Management</UI.Heading>
        <UI.Button variant="primary">
          <SVG.PlusIcon /> Add Business
        </UI.Button>
      </UI.Container>

      {/* Table */}
      <BusinessTable />
    </UI.Container>
  );
};
export default BusinessManagement;
