import { UI } from "@/components/ui";

export const UserDetailsForm = () => {
  return (
    <form className="space-y-5">
      <UI.Input
        type="text"
        id="first name"
        placeholder="First Name"
        defaultValue={"Nnamani"}
        labelValue="First Name"
      />
      <UI.Input
        type="text"
        id="last name"
        placeholder="Last Name"
        defaultValue={"Kester"}
        labelValue="Last Name"
      />
      <UI.Input
        type="email"
        id="email"
        placeholder="Full Name"
        defaultValue={"example@gmail.com"}
        labelValue="Email"
      />
      <UI.Input
        type="tel"
        id="number"
        placeholder="number"
        defaultValue={"09012345678"}
        labelValue="Number"
      />
      <UI.PrimaryButton disabled>Submit</UI.PrimaryButton>
    </form>
  );
};
