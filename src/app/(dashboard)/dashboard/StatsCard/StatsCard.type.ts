export type Variant = "positive" | "negative" | "muted" | "neutral";

type ValueProps = {
  title: string;
  value: string | number;
};

export interface PrimaryCardProps extends ValueProps {
  variant?: Variant;
}

export interface SecondaryCardProps extends ValueProps {
  icon: React.ReactNode;
}
