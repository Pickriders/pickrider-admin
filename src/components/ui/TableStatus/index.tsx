import { ActiveIcon } from "./Icons";

export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "BANNED";

type TableStatusProps = {
  status: UserStatus;
};

export const TableStatus = ({ status }: TableStatusProps) => {
  return (
    <>
      {/* // TODO: Handle status logic correlty */}
      {status === "ACTIVE" ? (
        <div className="flex items-center gap-x-1.5 text-[#3E7DF6]">
          <ActiveIcon />
          Active
        </div>
      ) : (
        <div className="flex items-center gap-x-1.5 text-[#C7CBE0]">
          <ActiveIcon className="fill-[#C7CBE0]" />
          Inactive
        </div>
      )}
    </>
  );
};
