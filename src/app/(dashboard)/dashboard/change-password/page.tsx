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
      <section className="mt-6 sm:mt-[3rem] bg-background rounded-2xl py-8 sm:py-14 px-4 sm:px-8">
        <div className="w-full max-w-[25rem] mx-auto">
          <h1 className="text-center text-xl sm:text-[1.5rem] font-clash-display font-semibold">
            Change Password
          </h1>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            Use a strong password you don&apos;t use elsewhere.
          </p>
          <div className="mt-10 sm:mt-12">
            <PasswordForm />
          </div>
        </div>
      </section>
    </div>
  );
};
export default ChangePasswordPage;
