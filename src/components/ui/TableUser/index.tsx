interface TableUser {
  name: string;
  // img:string;
  // email:string
}

export const TableUser = ({ name }: TableUser) => {
  return (
    <div className="flex items-center gap-x-2">
      <div className="size-[1.7rem] shrink-0 rounded-full bg-muted/70"></div>
      <div className="text-nowrap">
        <p className="font-semibold font-faktum-test">{name}</p>
        <span></span>
      </div>
    </div>
  );
};
