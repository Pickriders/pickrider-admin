import {
  Select as SelectContainer,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

export const Select = ({
  items,
  id,
  placeholder,
  onChange,
  width,
  defaultValue,
}: SelectProps) => {
  return (
    <SelectContainer onValueChange={onChange}>
      <SelectTrigger width={width} id={id}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {items.map((item, i) => {
          return (
            <SelectItem defaultValue={"all"} key={i} value={`${item.value}`}>
              {item.label}
            </SelectItem>
          );
        })}
      </SelectContent>
    </SelectContainer>
  );
};
