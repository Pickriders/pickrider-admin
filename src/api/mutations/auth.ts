import { MutationOptions } from "@tanstack/react-query";
import {
  apiService,
  CheckTokenValidityData,
  LoginData,
  LoginRequestDto,
  PasswordResetData,
  PasswordResetRequestData,
  queryClient,
  ResendTokenData,
  ResetPasswordRequestDto,
  TokenRequestDto,
  VerifyEmailData,
  VerifyEmailRequestDto,
  VerifyPhoneData,
  VerifyPhoneRequestDto,
} from "@/services";
import { USER_KEY } from "../queries/user";
import { useApiMutation } from "@/hooks/useApiMutation";

export const useLoginMn = (options?: MutationOptions<LoginData, any, LoginRequestDto>) => {
  return useApiMutation({
    ...options,
    mutationFn: (varaibles) => apiService.login(varaibles),
    onError(error, variables, context) { 
      if (error?.code === "UNVERIFIED") {
        // TODO: Redirect the user to verification screen
        options?.onError?.(error, variables, context);
      }
    },
    onSuccess(data, variables, context) {
      // TODO: Save the token to storage
      options?.onSuccess?.(data, variables, context);
    }
  });
};

export const useVerifyPhoneMn = (options?: MutationOptions<VerifyPhoneData, any, VerifyPhoneRequestDto>) =>
  useApiMutation({
    ...options,
    mutationFn: async (varaibles) => apiService.verifyPhone(varaibles),
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({ queryKey: [USER_KEY.USERS] });
      options?.onSuccess?.(data, variables, context);
    },
  });

export const useVerifyEmailMn = (options?: MutationOptions<VerifyEmailData, any, VerifyEmailRequestDto>) =>
  useApiMutation({
    ...options,
    mutationFn: async (varaibles) => apiService.verifyEmail(varaibles),
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({ queryKey: [USER_KEY.USERS] });
      options?.onSuccess?.(data, variables, context);
    },
  });

export const useResetPasswordMn = (options?: MutationOptions<PasswordResetData, any, ResetPasswordRequestDto>) =>
  useApiMutation({
    ...options,
    mutationFn: async (varaibles) => apiService.passwordReset(varaibles),
  });

export const useRequestPasswordResetMn = (options?: MutationOptions<PasswordResetRequestData, any, TokenRequestDto>) =>
  useApiMutation({
    ...options,
    mutationFn: async (varaibles) => apiService.passwordResetRequest(varaibles),
  });

export const useResendTokenMn = (options?: MutationOptions<ResendTokenData, any, TokenRequestDto>) =>
  useApiMutation({
    ...options,
    mutationFn: async (varaibles) => apiService.resendToken(varaibles),
  });

export const useCheckTokenMn = (options?: MutationOptions<CheckTokenValidityData, any, VerifyPhoneRequestDto>) =>
  useApiMutation({
    ...options,
    mutationFn: async (varaibles) => apiService.checkTokenValidity(varaibles),
  });
