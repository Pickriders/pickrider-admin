"use client";

import { UI } from "@/components/common";
import { BusinessActionBar } from "./BusinessActionBar";
import { SVG } from "@/components/svg";
import { useRowSelection } from "@/hooks";

const businessData = [
  {
    serialNumber: "S/N",
    business: <>Business</>,
    earnings: "Earnings",
    withdrawals: "Withdrawals",
    Debt: "Debt",
    motorbikes: <>Motorbikes</>,
    couriers: <>Couriers</>,
    status: <>Status</>,
    verified: <>Verified</>,
  },
  {
    serialNumber: "S/N",
    business: <>Business</>,
    earnings: "Earnings",
    withdrawals: "Withdrawals",
    Debt: "Debt",
    motorbikes: <>Motorbikes</>,
    couriers: <>Couriers</>,
    status: <>Status</>,
    verified: <>Verified</>,
  },
  {
    serialNumber: "S/N",
    business: <>Business</>,
    earnings: "Earnings",
    withdrawals: "Withdrawals",
    Debt: "Debt",
    motorbikes: <>Motorbikes</>,
    couriers: <>Couriers</>,
    status: <>Status</>,
    verified: <>Verified</>,
  },
  {
    serialNumber: "S/N",
    business: <>Business</>,
    earnings: "Earnings",
    withdrawals: "Withdrawals",
    Debt: "Debt",
    motorbikes: <>Motorbikes</>,
    couriers: <>Couriers</>,
    status: <>Status</>,
    verified: <>Verified</>,
  },
  {
    serialNumber: "S/N",
    business: <>Business</>,
    earnings: "Earnings",
    withdrawals: "Withdrawals",
    Debt: "Debt",
    motorbikes: <>Motorbikes</>,
    couriers: <>Couriers</>,
    status: <>Status</>,
    verified: <>Verified</>,
  },
  {
    serialNumber: "S/N",
    business: <>Business</>,
    earnings: "Earnings",
    withdrawals: "Withdrawals",
    Debt: "Debt",
    motorbikes: <>Motorbikes</>,
    couriers: <>Couriers</>,
    status: <>Status</>,
    verified: <>Verified</>,
  },
  {
    serialNumber: "S/N",
    business: <>Business</>,
    earnings: "Earnings",
    withdrawals: "Withdrawals",
    Debt: "Debt",
    motorbikes: <>Motorbikes</>,
    couriers: <>Couriers</>,
    status: <>Status</>,
    verified: <>Verified</>,
  },
];

export const BusinessTable = () => {
  const { handleRowSelect, handleSelectAll, selectedRows } = useRowSelection();

  return (
    <UI.Container marginTop={20} paddingBottom={"3rem"}>
      <UI.Table
        actionBar={<BusinessActionBar />}
        head={{
          action: (
            <UI.Checkbox
              onCheckedChange={() => handleSelectAll(businessData.length)}
            />
          ),
          serialNumber: "S/N",
          business: <>Business</>,
          earnings: "Earnings",
          withdrawals: "Withdrawals",
          Debt: "Debt",
          motorbikes: <>Motorbikes</>,
          couriers: <>Couriers</>,
          status: <>Status</>,
          verified: <>Verified</>,
          actions: <>Actions</>,
        }}
        data={businessData.map((business, i) => {
          return {
            action: (
              <UI.Checkbox
                checked={selectedRows.includes(i)}
                onCheckedChange={() => handleRowSelect(i)}
              />
            ),
            serialNumber: `${i + 1}`,
            business: <UI.TableUser userName="Petlin Agro" />,
            earnings: "$240,000",
            withdrawals: "$240,000",
            Debt: "-$40,000",
            motorbikes: (
              <UI.Container display="flex" alignItems="center" columnGap={10}>
                <span>32</span>
                <UI.Text variant="heading" color="#956810">
                  View
                </UI.Text>
              </UI.Container>
            ),
            couriers: (
              <UI.Container display="flex" alignItems="center" columnGap={10}>
                <span>32</span>
                <UI.Text variant="heading" color="#956810">
                  View
                </UI.Text>
              </UI.Container>
            ),
            status: <UI.TableStatus status="active" />,
            verified: (
              <UI.Container display="flex" alignItems="center" columnGap={5}>
                <SVG.GreenTick />
                <UI.Text>Yes</UI.Text>
              </UI.Container>
            ),
            actions: (
              <UI.Container display="flex" alignItems="center" columnGap={10}>
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
