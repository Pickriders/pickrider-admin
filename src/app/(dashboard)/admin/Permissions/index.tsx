import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import { ChevronDown } from "lucide-react";
import { PermissionAccordion } from "./Accordion";

export const Permissions = () => {
  return (
    <div className="w-[19rem]">
      <UI.PrimaryHeading text="Permissions" />
      <div className="mt-8">
        <div className="flex items-center gap-x-3 py-3 px-2 ">
          <UI.Switch />
          <div className="flex items-center gap-x-3">
            <SVG.HomeIcon />
            <span className="font-clash-display font-semibold text-sm text-primary-gray">
              Dashboard
            </span>
          </div>
        </div>

        <PermissionAccordion
          triggerIcon={<SVG.PersonGropBoldIcon />}
          triggertext="Customers"
          permissions={[
            "View",
            "Add Customers",
            "Send Email",
            "Send Push Notification",
            "Suspend",
            "Delete",
          ]}
        />

        <PermissionAccordion
          triggerIcon={<SVG.PepleGroup />}
          triggertext="Business"
          permissions={[
            "View",
            "Add Customers",
            "Send Email",
            "Send Push Notification",
            "Suspend",
            "Delete",
          ]}
        />
        <PermissionAccordion
          triggerIcon={<SVG.PersonAcceptIcon />}
          triggertext="Couriers"
          permissions={[
            "View",
            "Add Customers",
            "Send Email",
            "Send Push Notification",
            "Suspend",
            "Delete",
          ]}
        />
        <PermissionAccordion
          triggerIcon={<SVG.CategoryIcon />}
          triggertext="Vehicle"
          permissions={["View", "Verify", "Suspend", "Delete"]}
        />
        <PermissionAccordion
          triggerIcon={<SVG.Card />}
          triggertext="Finances"
          permissions={["View", "Payout", "Withdraw"]}
        />
        <PermissionAccordion
          triggerIcon={<SVG.MenuIcon />}
          triggertext="Orders"
          permissions={["View", "Delete", "Mark as complete", "Reassign Rider"]}
        />
        <PermissionAccordion
          triggerIcon={<SVG.ReportIcon />}
          triggertext="Reports & Complaints"
          permissions={["View", "Respond", "Create Ticket", "Close Ticket"]}
        />
        <PermissionAccordion
          triggerIcon={<SVG.ShieldKey />}
          triggertext="Admin"
          permissions={["Add member", "Permissions", "App settiings"]}
        />

        {/* <UI.PrimaryButton disabled className="mt-4">
          Save
        </UI.PrimaryButton> */}
      </div>
    </div>
  );
};
