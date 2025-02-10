interface IBusinessBalance {
  email: string;
  firstname: string;
  lastname: string;
}

export const BusinessBalance = ({ email, firstname, lastname }: IBusinessBalance) => {
  return (
    <div className="flex items-center gap-x-3">
      <div className="w-[10rem] h-[4.4rem] bg-accent rounded-lg p-3.5">
        <p className="truncate font-semibold text-xs font-montserrat">{email}</p>
        <h4 className="font-clash-display mt-2 font-semibold text-primary-purple">
          {firstname} {lastname}
        </h4>
      </div>

      <div className="w-[7.5rem] h-[4.4rem] p-3.5 bg-accent-foreground rounded-lg text-primary-foreground">
        <p className="text-xs font-montserrat font-semibold">Balance</p>
        <h4 className="font-clash-display mt-2 font-semibold truncate">$304,000</h4>
      </div>
    </div>
  );
};
