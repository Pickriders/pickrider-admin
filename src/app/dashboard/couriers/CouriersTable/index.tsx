"use client";

import { UI } from "@/components/common";
import { SVG } from "@/components/svg";
import { useRowSelection } from "@/hooks";
import { CouriersActionBar } from "./CouriersActionBar";

const couriersData = [
  {
    courierName: (
      <UI.TableUser
        userName="Nnamani Kester Ifeanyi"
        userEmail="kes@email.com"
      />
    ),
    phoneNumber: "08123456789",
    address: "33B Sir Ken Nnamdi Drive, Ind. Lay. Enugu",
    liscence: <UI.Text color="#3E7DF6">View liscence</UI.Text>,
    dateJoined: "$3,443,444,553",
  },
  {
    courierName: (
      <UI.TableUser
        userName="Nnamani Kester Ifeanyi"
        userEmail="kes@email.com"
      />
    ),
    phoneNumber: "08123456789",
    address: "33B Sir Ken Nnamdi Drive, Ind. Lay. Enugu",
    liscence: <UI.Text color="#3E7DF6">View liscence</UI.Text>,
    dateJoined: "$3,443,444,553",
  },
  {
    courierName: (
      <UI.TableUser
        userName="Nnamani Kester Ifeanyi"
        userEmail="kes@email.com"
      />
    ),
    phoneNumber: "08123456789",
    address: "33B Sir Ken Nnamdi Drive, Ind. Lay. Enugu",
    liscence: <UI.Text color="#3E7DF6">View liscence</UI.Text>,
    dateJoined: "$3,443,444,553",
  },
  {
    courierName: (
      <UI.TableUser
        userName="Nnamani Kester Ifeanyi"
        userEmail="kes@email.com"
      />
    ),
    phoneNumber: "08123456789",
    address: "33B Sir Ken Nnamdi Drive, Ind. Lay. Enugu",
    liscence: <UI.Text color="#3E7DF6">View liscence</UI.Text>,
    dateJoined: "$3,443,444,553",
  },
  {
    courierName: (
      <UI.TableUser
        userName="Nnamani Kester Ifeanyi"
        userEmail="kes@email.com"
      />
    ),
    phoneNumber: "08123456789",
    address: "33B Sir Ken Nnamdi Drive, Ind. Lay. Enugu",
    liscence: <UI.Text color="#3E7DF6">View liscence</UI.Text>,
    dateJoined: "$3,443,444,553",
  },
  {
    courierName: (
      <UI.TableUser
        userName="Nnamani Kester Ifeanyi"
        userEmail="kes@email.com"
      />
    ),
    phoneNumber: "08123456789",
    address: "33B Sir Ken Nnamdi Drive, Ind. Lay. Enugu",
    liscence: <UI.Text color="#3E7DF6">View liscence</UI.Text>,
    dateJoined: "$3,443,444,553",
  },
];

export const CouriersTable = () => {
  const { handleRowSelect, handleSelectAll, selectedRows } = useRowSelection();

  return (
    <UI.Container marginTop={20} paddingBottom={"3rem"}>
      <UI.Table
        actionBar={<CouriersActionBar />}
        head={{
          action: (
            <UI.Checkbox
              onCheckedChange={() => handleSelectAll(couriersData.length)}
            />
          ),
          serialNumber: "S/N",
          courierName: <>Courier Name</>,
          phoneNumber: "Phone Number",
          address: "Address",
          liscence: <>Liscence</>,
          dateJoined: "Date Joined",
          actions: <>Actions</>,
        }}
        data={couriersData.map((courier, i) => {
          return {
            action: (
              <UI.Checkbox
                checked={selectedRows.includes(i)}
                onCheckedChange={() => handleRowSelect(i)}
              />
            ),
            serialNumber: `${i + 1}`,
            courierName: (
              <UI.TableUser
                userName="Nnamani Kester Ifeanyi"
                userEmail="kes@email.com"
              />
            ),
            phoneNumber: "08123456789",
            address: "33B Sir Ken Nnamdi Drive, Ind. Lay. Enugu",
            liscence: courier.liscence,
            dateJoined: courier.dateJoined,
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
