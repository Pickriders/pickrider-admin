import { UI } from "@/components/common";
import { KybTable } from "./kybTable";

const KybManagement = () => {
  return (
    <UI.Container padding={"3rem 2rem 0 2rem"}>
      <UI.Container display="flex" justifyContent="space-between">
        <UI.Heading variant="h2">KYB Management</UI.Heading>
      </UI.Container>

      {/* Table */}
      <KybTable />
    </UI.Container>
  );
};
export default KybManagement;
