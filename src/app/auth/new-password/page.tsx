import { Suspense } from "react";
import { NewPasswordContainer } from "../../auth/new-password/NewPasswordContainer";

const NewPassword = () => {
  return (
    <Suspense>
      <NewPasswordContainer />
    </Suspense>
  );
};

export default NewPassword;
