import { UI } from "@/components/ui";
import { UserProfilePic } from "./UserProfilePic";
import { UserDetailsForm } from "./UserDetailsForm";

const ProfilePage = () => {
  return (
    <div>
      <UI.BreadCrumbNav
        currentPage="Profile"
        pageLinks={[{ href: "/dashboard", label: "Dashboard" }]}
        rootPageLink="/dashboard"
      />

      <section className="mt-6 sm:mt-[3rem] bg-background rounded-2xl py-8 sm:py-14 px-4 sm:px-8">
        <div className="w-full max-w-[25rem] mx-auto">
          <h1 className="text-center text-xl sm:text-[1.5rem] font-clash-display font-semibold">
            Profile
          </h1>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            Update your personal details and photo.
          </p>

          <div>
            <UserProfilePic />
          </div>

          <div className="mt-7">
            <UserDetailsForm />
          </div>
        </div>
      </section>
    </div>
  );
};
export default ProfilePage;
