import style from "./styles.module.scss";

import { UI } from "@/components/common";
import { SVG } from "@/components/svg";
import Link from "next/link";

export const Topbar = () => {
  return (
    <UI.Container element={"header"} className={style.topbar}>
      <UI.Container />

      <UI.Container display="flex" alignItems="center" columnGap={"4rem"}>
        <UI.Input leftIcon={<SVG.SearchIcon />} placeholder="Search anything" />

        <Link href={""}>
          <SVG.MessageIcon />
        </Link>
        <Link href={""}>
          <SVG.NotificationIcon />
        </Link>

        <UI.Dropdown
          trigger={
            <UI.Button variant="outline">
              <UI.Container
                borderRadius="99999px"
                marginRight="1.7rem"
                width={32}
                height={32}
                backgroundColor="#6F99EA"
                color="#fff"
                display="grid"
                placeItems="center"
              >
                s
              </UI.Container>
              <UI.Text Element={"span"}>
                <SVG.ChevronDown />
              </UI.Text>
            </UI.Button>
          }
        >
          <UI.Button variant="business">Account</UI.Button>
        </UI.Dropdown>
      </UI.Container>
    </UI.Container>
  );
};
