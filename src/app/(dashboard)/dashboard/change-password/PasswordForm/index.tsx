import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";

export const PasswordForm = () => {
  return (
    <form className="space-y-7">
      <UI.Input
        type="password"
        id="Current Password"
        labelValue="Current Password"
      />
      <UI.Input type="password" id="New Password" labelValue="New Password" />
      <UI.Input
        type="password"
        id="Confirm Password"
        labelValue="Confirm Password"
      />
      <div className="flex items-center gap-x-2">
        <UI.PrimaryButton variant="outline">Cancel</UI.PrimaryButton>
        <UI.PrimaryButton disabled>Update Password</UI.PrimaryButton>
      </div>
    </form>
  );
};
