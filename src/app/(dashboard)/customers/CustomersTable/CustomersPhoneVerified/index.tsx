import { CircleX } from "lucide-react";
import { TickVerifiedIcon } from "./TickVerifiedIcon";

export const CustomerPhoneVerified = ({ verified }: { verified: boolean }) => {
  return (
    <div className="flex items-center gap-x-1.5">
      {verified ? <TickVerifiedIcon /> : <CircleX size={15} color="#ae1616" />}
      <span>Phone</span>
    </div>
  );
};
