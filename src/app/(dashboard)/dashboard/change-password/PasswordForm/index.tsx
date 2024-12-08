import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";

export const PasswordForm = () => {
  return (
    <form className="space-y-7">
      <UI.Input
        type="password"
        id="Current Password"
        labelValue="Current Password"
        className="placeholder:invisible"
      />
      <UI.Input
        type="password"
        id="New Password"
        labelValue="New Password"
        className="placeholder:invisible font"
      />
      <UI.Input
        type="password"
        id="Confirm Password"
        labelValue="Confirm Password"
        className="placeholder:invisible"
      />

      <div className="flex items-center gap-x-2">
        <UI.PrimaryButton variant="outline">Cancel</UI.PrimaryButton>
        <UI.PrimaryButton disabled>Update Password</UI.PrimaryButton>
      </div>
    </form>
  );
};
