"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import style from "./styles.module.scss";

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ ...props }, ref) => (
  <SwitchPrimitives.Root className={style.switch} {...props} ref={ref}>
    <SwitchPrimitives.Thumb className={style.switch_thumb} />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;
