import { CSSProperties } from "react";

export type ContainerProps = {
  children?: React.ReactNode;
  display?: "grid" | "flex";
  gap?: CSSProperties["gap"];
  rowGap?: CSSProperties["rowGap"];
  columnGap?: CSSProperties["columnGap"];
  width?: CSSProperties["width"];
  maxWidth?: CSSProperties["maxWidth"];
  height?: CSSProperties["height"];
  padding?: CSSProperties["padding"];
  margin?: CSSProperties["margin"];
  columns?: number;
  justifyContent?: CSSProperties["justifyContent"];
  flexDirection?: CSSProperties["flexDirection"];
  alignItems?: CSSProperties["alignItems"];
  placeItems?: CSSProperties["placeItems"];
  backgroundColor?: CSSProperties["backgroundColor"];
  element?: React.ElementType;
};
