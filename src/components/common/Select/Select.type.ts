export interface ItemsProps {
  value: string | number;
  label: string | number;
}

export type SelectProps = {
  items: ItemsProps[];
  placeholder?: string | number;
  id?: string;
};
