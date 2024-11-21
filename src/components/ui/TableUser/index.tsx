interface TableUser {}

export const TableUser = ({}: TableUser) => {
  return (
    <div className="flex items-center gap-x-2">
      <div className="size-[1.7rem] shrink-0 rounded-full bg-muted/50"></div>
      <div>
        <p className="font-semibold font-faktum-test">Nnamani Kester</p>
        <span></span>
      </div>
    </div>
  );
};
