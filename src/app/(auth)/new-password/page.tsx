import { Suspense } from "react";
import { NewPasswordContainer } from "./NewPasswordContainer";

const NewPassword = () => {
  return (
    <Suspense>
      <NewPasswordContainer />
    </Suspense>
  );
};

export default NewPassword;
