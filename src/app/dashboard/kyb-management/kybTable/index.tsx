"use client";

import { UI } from "@/components/common";
import { useRowSelection } from "@/hooks";
import Link from "next/link";

export const KybTable = () => {
  const { handleRowSelect, handleSelectAll, selectedRows } = useRowSelection();

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
          action: <UI.Checkbox onCheckedChange={() => handleSelectAll(10)} />,
          serialNumber: "S/N",
          businessName: "Business Name",
          regNumber: "Bus. Reg. No.",
          registrarsName: "Registrars Name",
          phoneNumber: "Phone Number",
          address: "Address",
          cacDoc: <>CAC Doc</>,
          status: <>Status</>,
          actions: <>Actions</>,
        }}
        data={Array(10)
          .fill(0)
          .map((data, i) => {
            return {
              action: (
                <UI.Checkbox
                  checked={selectedRows.includes(i)}
                  onCheckedChange={() => handleRowSelect(i)}
                />
              ),
              serialNumber: "1",
              businessName: "Petlin Ventures",
              regNumber: "00000000000",
              registrarsName: "Nnamani Kester",
              phoneNumber: "08123456789",
              address: "33B Sir Ken Nnamdi Driv...",
              cacDoc: (
                <Link
                  style={{ color: "#3E7DF6", textDecoration: "underline" }}
                  href={""}
                >
                  View Document
                </Link>
              ),
              status: <UI.TableStatus status="pending" />,
              actions: (
                <>
                  <UI.Button
                    fontWeight={400}
                    display="block"
                    color="#FFFFFF"
                    borderRadius={9999}
                    background="#32BA7C"
                  >
                    Accept
                  </UI.Button>
                  <UI.Button
                    fontWeight={400}
                    marginTop={5}
                    color="#FFFFFF"
                    borderRadius={9999}
                    background="#FF5244"
                  >
                    Decline
                  </UI.Button>
                </>
              ),
            };
          })}
      />
    </UI.Container>
  );
};
