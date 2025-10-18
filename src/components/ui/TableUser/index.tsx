import Image from "next/image";

interface TableUser {
  name: string;
  img?: string;
  subText?: string;
  email?: string;
}

export const TableUser = ({ name, subText, img, email }: TableUser) => {
  return (
    <div className="flex items-center gap-x-2">
      <div className="size-[1.7rem] shrink-0 rounded-full bg-muted/70">
        {!!img && <Image src={img} width={30} height={30} alt={name} className="object-cover rounded-full" />}
      </div>
      <div className="text-nowrap">
        <p className="font-semibold font-faktum-test">{name}</p>
        {email && <p>{email}</p>}
        {subText && <p className="text-muted-foreground">{subText}</p>}
      </div>
    </div>
  );
};
