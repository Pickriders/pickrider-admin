"use client";

import { UI } from "@/components/common";
import { SVG } from "@/components/svg";
import React from "react";
import { Statusunion } from "./Customerstable.type";
import { useRowSelection } from "@/hooks";
import { CustomerActionBar } from "./CustomersActionBar";

const customersData = [
  {
    serialNumber: "1",
    balance: "#43,650.02",
    user: { userName: "Nnamani Kester", img: "" },
    verified: "",
    status: "active" as Statusunion,
    lastLogin: "",
    orders: "345 completed",
  },
  {
    serialNumber: "1",
    balance: "#43,650.02",
    user: { userName: "Nnamani Kester", img: "" },
    verified: "",
    status: "pending" as Statusunion,
    lastLogin: "",
    orders: "345 completed",
  },
  {
    serialNumber: "1",
    balance: "#43,650.02",
    user: { userName: "Nnamani Kester", img: "" },
    verified: "",
    status: "verified" as Statusunion,
    lastLogin: "",
    orders: "345 completed",
  },
];

export const CustomersTable = () => {
  const { selectedRows, handleRowSelect, handleSelectAll } = useRowSelection();

  return (
    <UI.Container marginTop={20}>
      <UI.Table
        actionBar={<CustomerActionBar />}
        head={{
          actions: (
            <UI.Checkbox
              onCheckedChange={() => handleSelectAll(customersData.length)}
            />
          ),
          serialNumber: "S/N",
          balance: "Balance",
          user: <>User</>,
          verified: <>Verified</>,
          status: <>Status</>,
          lastLogin: <>Last Login</>,
          orders: "Orders",
        }}
        data={customersData.map((customer, i) => ({
          actions: (
            <UI.Checkbox
              checked={selectedRows.includes(i)}
              onCheckedChange={() => handleRowSelect(i)}
            />
          ),
          serialNumber: customer.serialNumber,
          balance: customer.balance,
          user: <UI.TableUser userName={customer.user.userName} />,

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
          status: <UI.TableStatus status={customer.status} />,
          lastLogin: (
            <UI.Text>
              <UI.Text Element={"span"} style={{ display: "block" }}>
                9:42pm
              </UI.Text>
              <UI.Text Element={"span"}>12/04/23</UI.Text>
            </UI.Text>
          ),
          orders: customer.orders,
        }))}
      />
    </UI.Container>
  );
};
