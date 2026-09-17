import { MutationOptions } from "@tanstack/react-query";
import { auth, type LoginResult } from "@/lib/admin/api";
import {
  apiService,
  CheckTokenValidityData,
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
import { useApiMutation } from "@/hooks/useApiMutation";
import { useAuth } from "@/hooks/useAuth";

/**
 * Admin sign-in. Any platform staff role gets in — the console no longer names a role, the
 * backend checks the account holds one and the guards decide what it can do afterwards.
 */
export const useLoginMn = (
  rememberMe?: boolean,
  options?: MutationOptions<LoginResult, any, { identifier: string; password: string }>,
) => {
  const { login } = useAuth();

  return useApiMutation({
    ...options,
    mutationFn: (variables) => auth.login(variables),
    onError(error, variables, context) {
      options?.onError?.(error, variables, context);
    },
    onSuccess(data, variables, context) {
      login(data.accessToken, rememberMe);
      options?.onSuccess?.(data, variables, context);
    },
  });
};

export const useVerifyPhoneMn = (options?: MutationOptions<VerifyPhoneData, any, VerifyPhoneRequestDto>) =>
  useApiMutation({
    ...options,
    mutationFn: async (varaibles) => apiService.verifyPhone(varaibles),
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      options?.onSuccess?.(data, variables, context);
    },
  });

export const useVerifyEmailMn = (options?: MutationOptions<VerifyEmailData, any, VerifyEmailRequestDto>) =>
  useApiMutation({
    ...options,
    mutationFn: async (varaibles) => apiService.verifyEmail(varaibles),
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({ queryKey: ["me"] });
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
