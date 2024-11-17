import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import Link from "next/link";
import { UserDetailsForm } from "./UserDetailsForm";
import { UserProfilePic } from "./UserProfilePic";

const ProfilePage = () => {
  return (
    <div>
      <div className="flex items-center justify-between">
        <UI.Breadcrumb>
          <UI.BreadcrumbList>
            <UI.BreadcrumbItem>
              <UI.BreadcrumbLink href="/dashboard">Dashboard</UI.BreadcrumbLink>
            </UI.BreadcrumbItem>
            <UI.BreadcrumbSeparator />
            <UI.BreadcrumbItem>
              <UI.BreadcrumbPage>Profile</UI.BreadcrumbPage>
            </UI.BreadcrumbItem>
          </UI.BreadcrumbList>
        </UI.Breadcrumb>
        <Link
          href={"/dashboard"}
          className="font-semibold flex items-center gap-x-2 text-sm text-foreground font-clash-display"
        >
          <SVG.XIcon width={18} />
          Close
        </Link>
      </div>

      <section className="mt-[3rem] bg-background rounded-2xl py-10 px-8">
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
