export const BusinessBalance = () => {
  return (
    <div className="flex items-center gap-x-3">
      <div className="w-[9.7rem] h-[4.4rem] bg-accent rounded-lg p-3.5">
        <p className="truncate font-semibold text-xs font-montserrat">
          kes@email.com
        </p>
        <h4 className="font-clash-display mt-2 font-semibold text-primary-purple">
          Peterson Corp
        </h4>
      </div>

      <div className="w-[7.5rem] h-[4.4rem] p-3.5 bg-accent-foreground rounded-lg text-primary-foreground">
        <p className="text-xs font-montserrat font-semibold">Balance</p>
        <h4 className="font-clash-display mt-2 font-semibold truncate">
          $304,000
        </h4>
      </div>
    </div>
  );
};
