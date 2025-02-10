"use client";

import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import { Check, LoaderCircle } from "lucide-react";
import React from "react";

export const FooterControl = () => {
  const [state, setState] = React.useState<"idle" | "loading" | "completed">(
    "idle"
  );

  const handleCompleted = async () => {
    setState("loading");
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setState("completed");
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <button
          disabled={state === "loading" || state === "completed"}
          onClick={handleCompleted}
          className="font-semibold flex px-3 py-1.5 gap-x-1 justify-center overflow-hidden  transition-[width]  duration-300   items-center text-xs text-[#32BA7C] border border-[#32BA7C] rounded-lg"
        >
          {state === "idle" && (
            <>
              <Check size={17} />
              Mark as complete
            </>
          )}

          {state === "loading" && (
            <>
              <LoaderCircle size={17} className="animate-spin" />
              Mark as complete
            </>
          )}

          {state === "completed" && "Completed"}
        </button>
      </div>
      <div className="flex items-center gap-x-4">
        <UI.Button
          variant={"outline"}
          className="border-primary text-primary"
          asChild
        >
          <button>
            <SVG.NavigatorTrack />
            Track Rider
          </button>
        </UI.Button>
        <UI.Button>
          <SVG.NightShield />
          Update Status
        </UI.Button>
      </div>
    </div>
  );
};
