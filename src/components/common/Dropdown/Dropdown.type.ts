import { CSSProperties } from "react";

type ReactNodeProps = React.ReactNode;

export type DropdownProps = {
  trigger: ReactNodeProps;
  children?: ReactNodeProps;
  side?: "top" | "right" | "bottom" | "left";
  marginRight?: CSSProperties["marginRight"];
  marginLeft?: CSSProperties["marginLeft"];
};
