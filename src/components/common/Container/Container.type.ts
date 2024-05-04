import { CSSProperties } from "react";

export type ContainerProps = {
  children: React.ReactNode;
  display?: "grid" | "flex";
  gap?: CSSProperties["gap"];
  columns?: number;
  justifyContent?: CSSProperties["justifyContent"];
  alignItems?: CSSProperties["alignItems"];
  placeItems?: CSSProperties["placeItems"];
};
