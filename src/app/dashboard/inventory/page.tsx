import { UI } from "@/components/common";
import { InventoryTable } from "./InventoryTable";

const InventoryPage = () => {
  return (
    <UI.Container padding={"3rem 2rem 0 2rem"}>
      <UI.Container display="flex" justifyContent="space-between">
        <UI.Heading variant="h2">Inventory Management</UI.Heading>
      </UI.Container>

      {/* Table */}
      <InventoryTable />
    </UI.Container>
  );
};
export default InventoryPage;
