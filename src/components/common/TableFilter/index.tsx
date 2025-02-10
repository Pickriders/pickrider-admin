import { SVG } from "@/components/svg";
import { Dropdown } from "../Dropdown";
import { Heading } from "../Heading";
import { Container } from "../Container";
import { Checkbox } from "../Checkbox";
import { Text } from "../Text";
import { Select } from "../Select";
import { Button } from "../Button";
import { actionBarStatus, actionBarType } from "@/constant";
import style from "./styles.module.scss";

export const TableFilter = () => {
  return (
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
              <Text marginBottom="1rem" variant="heading">
                Type
              </Text>

              <Select defaultValue="All" width="110px" items={actionBarType} />
            </Container>

            <Container>
              <Text marginBottom="1rem" variant="heading">
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
  );
};
