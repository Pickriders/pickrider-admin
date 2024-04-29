import { InputProps } from "./Input.type";
import style from "./styles.module.scss";
import { SVG } from "@/components/svg";

export const Input = ({ label, hasIcon, icon, ...rest }: InputProps) => {
  const className = `${style.input} ${hasIcon && style.input_withIcon} ${
    label && style.label
  }`;

  return (
    <div className={style.inputContainer}>
      {hasIcon && <span className={style.input_icon}>{icon}</span>}

      <input className={className} {...rest} />

      <label className={style.input_label}>{label}</label>
    </div>
  );
};
