import { PrimaryHeadingProps } from "./PrimaryHeading.type";

export const PrimaryHeading = ({ text }: PrimaryHeadingProps) => {
  return (
    <h1 className="font-clash-display font-semibold text-primary-purple">
      {text}
    </h1>
  );
};
