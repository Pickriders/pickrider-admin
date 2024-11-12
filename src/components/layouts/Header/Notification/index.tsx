import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import Link from "next/link";

export const Notification = () => {
  return (
    <div className="relative">
      <button className="size-[2.3rem]  grid place-items-center border rounded-full">
        <SVG.NotificationIcon />
      </button>
      {/* <UI.Card className="w-[316px]  -left-[20rem] rounded-lg top-[145%] h-[372px] absolute z-50">
        <UI.CardHeader className="flex-row items-center justify-between">
          <UI.CardTitle className="font-clash-display text-sm text-primary-purple">
            Notifications
          </UI.CardTitle>
          <button className="grid place-items-center !m-0">
            <SVG.CloseIcon />
          </button>
        </UI.CardHeader>
        <UI.CardContent className="h-[72%] space-y-3 overflow-auto">
          {Array(5)
            .fill(0)
            .map((_, i) => {
              return (
                <Link key={i} href={"#"} className="flex items-center gap-x-2">
                  <div className="size-[2rem] bg-gray-100 rounded-full"></div>
                  <div>
                    <p className="text-primary-purple text-xs">
                      You have requested a Withdrawal
                    </p>
                    <span className="text-primary-gray text-xs  inline-block">
                      3 mins ago
                    </span>
                  </div>
                </Link>
              );
            })}
        </UI.CardContent>
        <UI.CardFooter>
          <button className="w-full text-[#956810] text-xs">
            Mark All as Read
          </button>
        </UI.CardFooter>
      </UI.Card>

      <UI.Overlay /> */}
    </div>
  );
};
