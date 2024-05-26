import { UI } from "@/components/common";
import { SVG } from "@/components/svg";
import { CustomersTable } from "./CustomersTable";

const Customers = () => {
  return (
    <UI.Container padding={"3rem 2rem 0 2rem"}>
      <UI.Container display="flex" justifyContent="space-between">
        <UI.Heading variant="h2">Customer Management</UI.Heading>
        <UI.Button variant="primary">
          <SVG.PlusIcon /> Add Customer
        </UI.Button>
      </UI.Container>

      {/* Table */}
      <CustomersTable />
    </UI.Container>
  );
};
export default Customers;
