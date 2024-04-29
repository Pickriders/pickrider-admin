import { InputProps } from "./Input.type";
import style from "./styles.module.scss";

export const Input = ({ label, rightIcon, leftIcon, ...rest }: InputProps) => {
  const className = `${style.input} ${rightIcon && style.input_withRightIcon} ${
    leftIcon && style.input_withLeftIcon
  } ${label && style.label}`;

  return (
    <div className={style.inputContainer}>
      {leftIcon && (
        <span className={`${style.input_leftIcon} ${style.input_icon}`}>
          {rightIcon}
        </span>
      )}

      {rightIcon && (
        <span className={`${style.input_rightIcon}  ${style.input_icon}`}>
          {rightIcon}
        </span>
      )}

      <input className={className} {...rest} />
      <label className={style.input_label}>{label}</label>
    </div>
  );
};
