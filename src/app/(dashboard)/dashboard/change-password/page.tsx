import { UI } from "@/components/ui";
import { PasswordForm } from "./PasswordForm";

const ChangePasswordPage = () => {
  return (
    <div>
      <UI.BreadCrumbNav
        rootPageLink="/dashboard"
        currentPage="Change Password"
        pageLinks={[{ href: "/dashboard", label: "Dashboard" }]}
      />
      <section className="mt-[3rem] bg-background rounded-2xl py-8 sm:py-14 px-4 sm:px-8">
        <div className="w-[25rem] mx-auto ">
          <h1 className="text-center text-[1.5rem] font-clash-display font-semibold">
            Change Password
          </h1>
          <div className="mt-12">
            <PasswordForm />
          </div>
        </div>
      </section>
    </div>
  );
};
export default ChangePasswordPage;
