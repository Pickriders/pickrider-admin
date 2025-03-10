import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

const LoginAuthPage = () => {
  return (
    <div className="max-w-[35rem] z-40 w-full mx-auto ">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
};
export default LoginAuthPage;
