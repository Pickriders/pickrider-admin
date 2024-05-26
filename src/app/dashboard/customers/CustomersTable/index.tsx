"use client";

import { UI } from "@/components/common";
import { SVG } from "@/components/svg";
import React from "react";

const tableData = [
  {
    actions: <UI.Checkbox />,
    serialNumber: "1",
    balance: "#43,650.02",
    user: <UI.TableUser username="Nnamani Kester" />,
    verified: (
      <UI.Container
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        columnGap={15}
      >
        <UI.Container display="flex" alignItems="center" columnGap={5}>
          <SVG.GreenTick />
          <UI.Text>Phone</UI.Text>
        </UI.Container>
        <UI.Container display="flex" alignItems="center" columnGap={5}>
          <SVG.GreenTick color="#F3F3F3" />
          <UI.Text>KYC</UI.Text>
        </UI.Container>
      </UI.Container>
    ),
    status: <UI.TableStatus status="active" />,
    lastLogin: (
      <UI.Text>
        <UI.Text Element={"span"} style={{ display: "block" }}>
          9:42pm
        </UI.Text>
        <UI.Text Element={"span"}>12/04/23</UI.Text>
      </UI.Text>
    ),
    orders: "345 completed",
  },
  {
    actions: <UI.Checkbox />,
    serialNumber: "2",
    balance: "#43,650.02",
    user: <UI.TableUser username="Nnamani Kester" />,
    verified: (
      <UI.Container
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        columnGap={15}
      >
        <UI.Container display="flex" alignItems="center" columnGap={5}>
          <SVG.GreenTick />
          <UI.Text>Phone</UI.Text>
        </UI.Container>
        <UI.Container display="flex" alignItems="center" columnGap={5}>
          <SVG.GreenTick color="#F3F3F3" />
          <UI.Text>KYC</UI.Text>
        </UI.Container>
      </UI.Container>
    ),
    status: <UI.TableStatus status="declined" />,
    lastLogin: (
      <UI.Text>
        <UI.Text Element={"span"} style={{ display: "block" }}>
          9:42pm
        </UI.Text>
        <UI.Text Element={"span"}>12/04/23</UI.Text>
      </UI.Text>
    ),
    orders: "345 completed",
  },
  {
    actions: <UI.Checkbox />,
    serialNumber: "3",
    balance: "#43,650.02",
    user: <UI.TableUser username="Nnamani Kester" />,
    verified: (
      <UI.Container
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        columnGap={15}
      >
        <UI.Container display="flex" alignItems="center" columnGap={5}>
          <SVG.GreenTick />
          <UI.Text>Phone</UI.Text>
        </UI.Container>
        <UI.Container display="flex" alignItems="center" columnGap={5}>
          <SVG.GreenTick color="#F3F3F3" />
          <UI.Text>KYC</UI.Text>
        </UI.Container>
      </UI.Container>
    ),
    status: <UI.TableStatus status="active" />,
    lastLogin: (
      <UI.Text>
        <UI.Text Element={"span"} style={{ display: "block" }}>
          9:42pm
        </UI.Text>
        <UI.Text Element={"span"}>12/04/23</UI.Text>
      </UI.Text>
    ),
    orders: "345 completed",
  },
];

export const CustomersTable = () => {
  const [selectedRows, setSelectedRows] = React.useState<number[]>([]);
  const [selectAll, setSelectAll] = React.useState(false);

  const handleRowSelect = (index: number) => {
    if (selectedRows.includes(index)) {
      setSelectedRows(selectedRows.filter((rowIndex) => rowIndex !== index));
    } else {
      setSelectedRows([...selectedRows, index]);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(tableData.map((_, index) => index));
    }
    setSelectAll(!selectAll);
  };

  return (
    <UI.Container marginTop={20}>
      <UI.Table
        actionBar={<UI.TableActionBar />}
        head={{
          actions: <UI.Checkbox />,
          serialNumber: "S/N",
          balance: "Balance",
          user: <>User</>,
          verified: <>Verified</>,
          status: <>Status</>,
          lastLogin: <>Last Login</>,
          orders: "Orders",
        }}
        data={tableData}
        onRowSelect={handleRowSelect}
        onSelectAll={handleSelectAll}
        selectedRows={selectedRows}
        isSelectAllChecked={selectAll}
      />
    </UI.Container>
  );
};
