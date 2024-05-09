import { CSSProperties } from "react";

export const Container: React.FC<ContainerProps> = ({
  className,
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

  return (
    <Comp className={className} style={containerStyle}>
      {children}
    </Comp>
  );
};
