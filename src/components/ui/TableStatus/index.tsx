import { ActiveIcon } from "./Icons";

type Status = "active" | "inactive" | "Suspended";

type TableStatusProps = {
  status: Status;
};

export const TableStatus = ({ status }: TableStatusProps) => {
  return (
    <>
      {status === "active" && (
        <div className="flex items-center gap-x-1.5 text-[#3E7DF6]">
          <ActiveIcon />
          Active
        </div>
      )}
      {status === "inactive" && (
        <div className="flex items-center gap-x-1.5 text-[#C7CBE0]">
          <ActiveIcon className="fill-[#C7CBE0]" />
          Inactive
        </div>
      )}
    </>
  );
};
