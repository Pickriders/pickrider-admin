import { UI } from "@/components/common";
import { SVG } from "@/components/svg";

const inventoryData = [
  {
    serialNumber: 1,
    plateNumber: "AE225EA",
    assignedTo: "Nnamani Kester",
    status: "active",
  },
  {
    serialNumber: 1,
    plateNumber: "AE225EA",
    assignedTo: "Nnamani Kester",
    status: "active",
  },
  {
    serialNumber: 1,
    plateNumber: "AE225EA",
    assignedTo: "Nnamani Kester",
    status: "active",
  },
  {
    serialNumber: 1,
    plateNumber: "AE225EA",
    assignedTo: "Nnamani Kester",
    status: "active",
  },
];

export const InventoryTable = () => {
  return (
    <UI.Container marginTop={20} paddingBottom={"3rem"}>
      <UI.Table
        actionBar={
          <UI.Container
            display="flex"
            justifyContent="end"
            height={"7rem"}
            padding={"1.8rem 2.5rem"}
          >
            <UI.Container display="flex" alignItems="center" columnGap={30}>
              <UI.TableSearchInput />
              <UI.TableFilter />
            </UI.Container>
          </UI.Container>
        }
        head={{
          action: <UI.Checkbox />,
          serialNumber: "S/N",
          plateNumber: <>Plate Number</>,
          assignedTo: <>Assigned to</>,
          status: <>Status</>,
          actions: <>Liscence</>,
        }}
        data={inventoryData.map((inventory, i) => {
          return {
            action: <UI.Checkbox />,
            serialNumber: `${i + 1}`,
            plateNumber: <UI.Text variant="heading">AE225EA</UI.Text>,
            assignedTo: <UI.TableUser userName="Nnamani Kester" />,
            status: <UI.TableStatus status="active" />,
            actions: (
              <UI.Container display="flex" alignItems="center" columnGap={20}>
                <UI.Button variant="ghost">
                  <SVG.EditIcon />
                </UI.Button>
                <UI.Switch />
              </UI.Container>
            ),
          };
        })}
      />
    </UI.Container>
  );
};
