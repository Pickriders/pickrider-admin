type StringOrNumber = string | number;

interface ItemProps {
  value: StringOrNumber;
  label: StringOrNumber;
}

type SelectProps = {
  items: ItemProps[];
  placeholder?: StringOrNumber;
  id?: string;
  width?: string;
  onChange?: (e: string | number) => void;
};
