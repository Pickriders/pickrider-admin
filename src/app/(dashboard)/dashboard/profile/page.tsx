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

      <section className="mt-[3rem] bg-background rounded-2xl py-14 px-8">
        <div className="w-[25rem] mx-auto ">
          <h1 className="text-center text-[1.5rem] font-clash-display font-semibold">
            Profile
          </h1>

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
