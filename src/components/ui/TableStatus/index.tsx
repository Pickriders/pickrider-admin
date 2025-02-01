import * as React from "react";
import { toTitleCase } from "@/utils";
import { ActiveIcon } from "./Icons";

export type AllStatuses =
  | "ACTIVE"
  | "INACTIVE"
  | "SUSPENDED"
  | "BANNED"
  | "VERIFIED"
  | "PENDING"
  | "REJECTED"
  | "APPROVE"
  | "DISAPPROVE"
  | "SUBMITTED";

type TableStatusProps = {
  status: AllStatuses;
  title?: string;
};

export const TableStatus = ({ status, title }: TableStatusProps) => {
  const statusColor = React.useMemo(() => {
    switch (status) {
      case "ACTIVE":
        return "#3E7DF6";
      case "INACTIVE":
        return "#D0D4EA";
      case "SUSPENDED":
        return "#FFC700";
      case "BANNED":
        return "#FF5244";
      case "VERIFIED":
        return "#32BA7C";
      case "PENDING":
        return "#FFA500";
      case "REJECTED":
        return "#FF5244";
      case "APPROVE":
        return "#32BA7C";
      case "DISAPPROVE":
        return "#FF5244";
      case "SUBMITTED":
        return "#FFA500";
      default:
        return "#FFFFFF";
    }
  }, [status]);

  return (
    <>
      <div className={`flex items-center gap-x-1.5 text-[${statusColor}]`} title={title}>
        <ActiveIcon className={`fill-[${statusColor}]`} />
        {toTitleCase(status)}
      </div>
    </>
  );
};
