type ContainerProps = {
  children?: React.ReactNode;
  display?: "grid" | "flex";
  gap?: React.CSSProperties["gap"];
  width?: React.CSSProperties["width"];
  height?: React.CSSProperties["height"];
  columns?: number;
  justifyContent?: React.CSSProperties["justifyContent"];
  alignItems?: React.CSSProperties["alignItems"];
  placeItems?: React.CSSProperties["placeItems"];
  backgroundColor?: React.CSSProperties["backgroundColor"];
};
