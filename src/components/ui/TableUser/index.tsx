import Image from "next/image";

interface TableUser {
  name: string;
  img?: string;
  subText?: string;
}

export const TableUser = ({ name, subText, img }: TableUser) => {
  return (
    <div className="flex items-center gap-x-2">
      <div className="size-[1.7rem] shrink-0 rounded-full bg-muted/70">
        {img && (
          <Image
            src={img}
            width={30}
            height={30}
            alt={name}
            className="object-cover"
          />
        )}
      </div>
      <div className="text-nowrap">
        <p className="font-semibold font-faktum-test">{name}</p>
        <span>{subText}</span>
      </div>
    </div>
  );
};
