import { CSSProperties } from "react";

export const Container: React.FC<ContainerProps> = ({
  display,
  children,
  columns,
  element: Comp = "div",
  ...rest
}) => {
  let containerStyle: CSSProperties = {
    display: display,
    gridTemplateColumns: columns && `repeat(${columns}, minmax(0, 1fr));`,
    ...rest,
  };

  return <Comp style={containerStyle}>{children}</Comp>;
};
