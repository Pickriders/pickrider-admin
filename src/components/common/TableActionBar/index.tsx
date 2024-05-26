import { SVG } from "@/components/svg";
import { Button } from "../Button";
import { Container } from "../Container";
import { Dropdown } from "../Dropdown";
import style from "./styles.module.scss";
import { DropdownMenuItem } from "../Dropdown/dropdown-menu";
import { Heading } from "../Heading";
import { Checkbox } from "../Checkbox";
import { Text } from "../Text";
import { Select } from "../Select";
import { Input } from "../Input";
import { SearchInput } from "./SearchInput";
import { actionBarStatus, actionBarType } from "@/constant";

export const TableActionBar = () => {
  return (
    <Container
      display="flex"
      height={"7rem"}
      justifyContent="space-between"
      padding={"1.8rem 2.5rem"}
    >
      <Container display="flex" columnGap={10}>
        <Dropdown
          trigger={
            <button className={style.actionDropdown}>
              <span>Bulk Action</span>
              <SVG.ChevronDown />
            </button>
          }
        >
          <Container width={106}>
            <DropdownMenuItem className={style.dropdownItem}>
              Send Email
            </DropdownMenuItem>
            <DropdownMenuItem className={style.dropdownItem}>
              Suspend
            </DropdownMenuItem>
            <DropdownMenuItem className={style.dropdownItem}>
              Delete
            </DropdownMenuItem>
          </Container>
        </Dropdown>

        <Button variant="outline">Apply</Button>
      </Container>

      <Container display="flex" alignItems="center" columnGap={30}>
        <SearchInput />

        <Dropdown
          marginRight={"3rem"}
          trigger={
            <button>
              <SVG.FilterIcon />
            </button>
          }
        >
          <Container width={311} className={style.dropdown_filterContent}>
            <Heading variant="h2" className={style.dropdown_filterHeading}>
              Filter Users
            </Heading>
            <Container padding={"1.5rem "}>
              <Container
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Container display="flex" alignItems="center" columnGap={5}>
                  <Checkbox />
                  <Text>Have Balance</Text>
                </Container>
                <Container display="flex" alignItems="center" columnGap={5}>
                  <Checkbox />
                  <Text>KYC Verified</Text>
                </Container>
              </Container>

              <Container
                marginTop={"3rem"}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Container>
                  <Text style={{ marginBottom: "1rem" }} variant="heading">
                    Type
                  </Text>
                  <Select
                    defaultValue="All"
                    width="110px"
                    items={actionBarType}
                  />
                </Container>

                <Container>
                  <Text style={{ marginBottom: "1rem" }} variant="heading">
                    STATUS
                  </Text>
                  <Select
                    defaultValue="Any"
                    width="110px"
                    items={actionBarStatus}
                  />
                </Container>
              </Container>

              <Container
                marginTop={"3rem"}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Button variant="ghost">Reset Filters</Button>
                <Button variant="primary">Save Filters</Button>
              </Container>
            </Container>
          </Container>
        </Dropdown>
      </Container>
    </Container>
  );
};
