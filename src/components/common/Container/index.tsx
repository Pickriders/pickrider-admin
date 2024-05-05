import { CSSProperties } from "react";
import { ContainerProps } from "./Container.type";
import style from "./styles.module.scss";

export const Container = ({
  display,
  children,
  columns,
  ...rest
}: ContainerProps) => {
  let containerStyle: CSSProperties = {
    display: display,
    gridTemplateColumns: columns && `repeat(${columns}, minmax(0, 1fr));`,
    ...rest,
  };

  return (
    <div className={`${style.container} `} style={containerStyle}>
      {children}
    </div>
  );
};
