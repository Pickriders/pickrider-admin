import { SVG } from "@/components/svg";

import style from "./styles.module.scss";

import { actionBarStatus, actionBarType } from "@/constant";
import { UI } from "@/components/common";

export const TableActionBar = () => {
  return (
    <UI.Container
      display="flex"
      height={"7rem"}
      justifyContent="space-between"
      padding={"1.8rem 2.5rem"}
    >
      <UI.Container display="flex" columnGap={10}>
        <UI.TableBulkActionDropdown />
        <UI.Button variant="outline">Apply</UI.Button>
      </UI.Container>

      <UI.Container display="flex" alignItems="center" columnGap={30}>
        <UI.TableSearchInput />

        <UI.Dropdown
          marginRight={"3rem"}
          trigger={
            <button>
              <SVG.FilterIcon />
            </button>
          }
        >
          <UI.Container width={311} className={style.dropdown_filterContent}>
            <UI.Heading variant="h2" className={style.dropdown_filterHeading}>
              Filter Users
            </UI.Heading>
            <UI.Container padding={"1.5rem "}>
              <UI.Container
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <UI.Container display="flex" alignItems="center" columnGap={5}>
                  <UI.Checkbox />
                  <UI.Text>Have Balance</UI.Text>
                </UI.Container>
                <UI.Container display="flex" alignItems="center" columnGap={5}>
                  <UI.Checkbox />
                  <UI.Text>KYC Verified</UI.Text>
                </UI.Container>
              </UI.Container>

              <UI.Container
                marginTop={"3rem"}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <UI.Container>
                  <UI.Text style={{ marginBottom: "1rem" }} variant="heading">
                    Type
                  </UI.Text>
                  <UI.Select
                    defaultValue="All"
                    width="110px"
                    items={actionBarType}
                  />
                </UI.Container>

                <UI.Container>
                  <UI.Text style={{ marginBottom: "1rem" }} variant="heading">
                    STATUS
                  </UI.Text>
                  <UI.Select
                    defaultValue="Any"
                    width="110px"
                    items={actionBarStatus}
                  />
                </UI.Container>
              </UI.Container>

              <UI.Container
                marginTop={"3rem"}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <UI.Button variant="ghost">Reset Filters</UI.Button>
                <UI.Button variant="primary">Save Filters</UI.Button>
              </UI.Container>
            </UI.Container>
          </UI.Container>
        </UI.Dropdown>
      </UI.Container>
    </UI.Container>
  );
};
