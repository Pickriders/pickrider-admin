type StringOrNumber = string | number;

export interface ItemProps {
  value: StringOrNumber;
  label: StringOrNumber;
}

export type SelectProps = {
  items: ItemProps[];
  placeholder?: StringOrNumber;
  id?: string;
  onChange?: (e: string | number) => void;
};
