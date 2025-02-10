import { SendOtpForm } from "./SendOtpForm";

const RestPassword = () => {
  return (
    <div>
      <h1 className="font-semibold text-2xl font-clash-display">
        Reset Password
      </h1>
      <div className="mt-8">
        <SendOtpForm />
      </div>
    </div>
  );
};
export default RestPassword;
