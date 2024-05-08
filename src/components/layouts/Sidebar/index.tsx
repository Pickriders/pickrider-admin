import { UI } from "@/components/common";
import { SVG } from "@/components/svg";
import { SidebarLink } from "./SidebarLink";
import style from "./styles.module.scss";

export const Sidebar = () => {
  return (
    <UI.Container
      element={"aside"}
      height={"100vh"}
      width={250}
      backgroundColor="#fff"
    >
      <div className={style.sidebar}>
        <ul className={style.list}>
          <SidebarLink
            path="dashboard"
            label="dashboard"
            icon={<SVG.CategoryIcon />}
          />
          <SidebarLink
            path="customers"
            label="Customers"
            icon={<SVG.PersonGropBoldIcon />}
          />
          <SidebarLink
            path="inventory"
            label="Inventory"
            icon={<SVG.CategoryIcon />}
          />
          <SidebarLink
            path="couriers"
            label="Couriers"
            icon={<SVG.PersonAcceptIcon />}
          />
          <SidebarLink
            path="payout/charges"
            label="Payout/Charges"
            icon={<SVG.DocumentIcon />}
          />
          <SidebarLink
            path="cards&payments"
            label="Cards & payments"
            icon={<SVG.AirpodIcon />}
          />
          <SidebarLink
            path="transactions"
            label="transactions"
            icon={<SVG.ReceiptIcon />}
          />
          <SidebarLink path="orders" label="Orders" icon={<SVG.MenuIcon />} />
          <SidebarLink
            path="Reports & Complaints"
            label="Reports & Complaints"
            icon={<SVG.ReportIcon />}
          />
        </ul>
      </div>
    </UI.Container>
  );
};
