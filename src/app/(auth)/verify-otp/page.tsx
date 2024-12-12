import { OtpForm } from "./OtpForm";

const VerifyOTP = () => {
  return (
    <div>
      <h1 className="font-semibold text-2xl font-clash-display">
        Reset Password
      </h1>
      <div className="mt-8">
        <OtpForm />
      </div>
    </div>
  );
};
export default VerifyOTP;
