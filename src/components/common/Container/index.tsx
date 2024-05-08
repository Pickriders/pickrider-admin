import { CSSProperties } from "react";
import { ContainerProps } from "./Container.type";

export const Container = ({
  display,
  children,
  columns,
  element: Comp = "div",
  ...rest
}: ContainerProps) => {
  let containerStyle: CSSProperties = {
    display: display,
    gridTemplateColumns: columns && `repeat(${columns}, minmax(0, 1fr));`,
    ...rest,
  };

  return (
    <Comp  style={containerStyle}>
      {children}
    </Comp>
  );
};
