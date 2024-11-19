import { UI } from "@/components/ui";
import { UserProfilePic } from "./UserProfilePic";
import { UserDetailsForm } from "./UserDetailsForm";

const ProfilePage = () => {
  return (
    <div>
      <UI.BreadCrumbNav
        currentPage="Profile"
        linkPage="Dashboard"
        rootPageLink="/dashboard"
      />

      <section className="mt-[3rem] bg-background rounded-2xl py-14 px-8">
        <div className="w-[25rem] mx-auto ">
          <h1 className="text-center text-[1.5rem] font-clash-display font-semibold">
            Profile
          </h1>

          <div>
            <div className="size-[10rem] rounded-full bg-primary-black mx-auto mt-[2rem] text-7xl font-semibold font-clash-display grid place-items-center text-white">
              P
            </div>

            <div className="mt-5">
              <UserProfilePic />
            </div>
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
