import { UI } from "@/components/ui";

export const PasswordForm = () => {
  return (
    <form className="space-y-6">
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
        className="placeholder:invisible"
      />
      <UI.Input
        type="password"
        id="Confirm Password"
        labelValue="Confirm Password"
        className="placeholder:invisible"
      />

      <div className="flex flex-col-reverse sm:flex-row items-stretch gap-3 pt-1">
        <UI.PrimaryButton variant="outline" className="w-full">
          Cancel
        </UI.PrimaryButton>
        <UI.PrimaryButton disabled className="w-full">
          Update Password
        </UI.PrimaryButton>
      </div>
    </form>
  );
};
