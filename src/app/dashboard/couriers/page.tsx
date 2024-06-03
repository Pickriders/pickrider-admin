import { UI } from "@/components/common";
import { SVG } from "@/components/svg";
import { CouriersTable } from "./CouriersTable";

const CouriersPage = () => {
  return (
    <UI.Container padding={"3rem 2rem 0 2rem"}>
      <UI.Container display="flex" justifyContent="space-between">
        <UI.Heading variant="h2">Courier Management</UI.Heading>
        <UI.Button variant="primary">
          <SVG.PlusIcon /> Add Driver
        </UI.Button>
      </UI.Container>

      {/* Table */}
      <CouriersTable />
    </UI.Container>
  );
};
export default CouriersPage;
