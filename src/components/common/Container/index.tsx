import { CSSProperties } from "react";
import style from "./styles.module.scss";

export const Container: React.FC<ContainerProps> = ({
  display,
  children,
  columns,
  ...rest
}) => {
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
