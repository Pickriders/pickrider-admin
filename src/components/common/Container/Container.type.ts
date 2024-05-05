import { CSSProperties } from "react";

export type ContainerProps = {
  children?: React.ReactNode;
  display?: "grid" | "flex";
  gap?: CSSProperties["gap"];
  width?: CSSProperties["width"];
  height?: CSSProperties["height"];
  columns?: number;
  justifyContent?: CSSProperties["justifyContent"];
  alignItems?: CSSProperties["alignItems"];
  placeItems?: CSSProperties["placeItems"];
  backgroundColor?: CSSProperties["backgroundColor"];
};
