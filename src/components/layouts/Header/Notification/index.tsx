"use client";

import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import { useQueryModal } from "@/hooks";
import { cn } from "@/lib/utils";
import Link from "next/link";

export const Notification = () => {
  const { closeModal, isOpen, setParam } = useQueryModal([{ key: "notification", value: true }]);

  return (
    <div className="relative">
      <button
        onClick={() => setParam("notification", "true")}
        className="size-[2.3rem] hover:bg-gray-50 dark:hover:bg-gray-50/10 transition-colors duration-300  grid place-items-center border rounded-full"
      >
        <SVG.NotificationIcon />
      </button>

      <UI.Card
        className={cn(
          "w-[316px] -left-[20rem] rounded-lg top-[145%] h-[372px] absolute z-[70]",
          isOpen
            ? "opacity-100 animate-in fade-in-0 visible zoom-in-95"
            : "opacity-0 animate-out fade-out-0 invisible zoom-out-95",
        )}
      >
        <UI.CardHeader className="flex-row items-center justify-between">
          <UI.CardTitle className="font-clash-display text-sm text-primary-purple">Notifications</UI.CardTitle>
          <button onClick={closeModal} className="grid place-items-center !m-0">
            <SVG.CloseIcon />
          </button>
        </UI.CardHeader>
        <UI.CardContent className="h-[70%] space-y-3 overflow-auto">
          {Array(5)
            .fill(0)
            .map((_, i) => {
              return (
                <Link key={i} href={"#"} className="flex items-center gap-x-2">
                  <div className="size-[2rem] bg-gray-100 rounded-full"></div>
                  <div>
                    <p className="text-primary-purple text-xs">You have requested a Withdrawal</p>
                    <span className="text-primary-gray text-xs  inline-block">3 mins ago</span>
                  </div>
                </Link>
              );
            })}
        </UI.CardContent>

        <UI.CardFooter>
          <button className="w-full text-[#956810] text-xs hover:bg-[#9569100d] py-2 rounded-lg transition-colors duration-300">
            Mark All as Read
          </button>
        </UI.CardFooter>
      </UI.Card>

      <UI.Overlay open={isOpen} openChange={closeModal} />
    </div>
  );
};
