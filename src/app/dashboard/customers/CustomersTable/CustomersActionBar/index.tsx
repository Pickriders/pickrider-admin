import { UI } from "@/components/common";

export const CustomerActionBar = () => {
  return (
    <UI.Container
      display="flex"
      height={"7rem"}
      padding={"1.8rem 2.5rem"}
      justifyContent="space-between"
    >
      <UI.Container display="flex" columnGap={10}>
        <UI.TableBulkActionDropdown />
        <UI.Button variant="outline">Apply</UI.Button>
      </UI.Container>

      <UI.Container display="flex" alignItems="center" columnGap={30}>
        <UI.TableSearchInput />

        <UI.TableFilter />
      </UI.Container>
    </UI.Container>
  );
};
