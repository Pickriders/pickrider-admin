import { ReactNode } from "react";

export interface PermissionAccordionProps {
  triggerIcon: ReactNode;
  triggertext: string;
  permissions: string[];
}
