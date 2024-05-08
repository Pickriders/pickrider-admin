type StringOrNumber = string | number;

interface ItemProps {
  value: StringOrNumber;
  label: StringOrNumber;
}

type SelectProps = {
  items: ItemProps[];
  placeholder?: StringOrNumber;
  id?: string;
  onChange?: (e: string | number) => void;
};
