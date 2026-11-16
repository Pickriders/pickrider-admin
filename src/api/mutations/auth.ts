import { MutationOptions } from "@tanstack/react-query";
import { auth, type LoginResult, type MfaChallengeInput } from "@/lib/admin/api";
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
import { useMutation } from "@tanstack/react-query";

/**
 * Admin sign-in, step one. Any platform staff role gets in; the backend checks the account holds
 * one and the guards decide what it can do afterwards. The result either carries tokens or asks
 * for the MFA challenge (`mfaRequired`); the login form decides what happens next, including
 * storing the session, so no toast or redirect happens here. Errors are not toasted either: the
 * form shows them inline with one uniform voice (see loginErrorMessage).
 */
export const useLoginMn = (options?: MutationOptions<LoginResult, unknown, { identifier: string; password: string }>) =>
  useMutation({ ...options, mutationFn: (variables) => auth.login(variables) });

/** Step two: the authenticator (or recovery) code against the mfaToken from step one. */
export const useMfaChallengeMn = (options?: MutationOptions<LoginResult, unknown, MfaChallengeInput>) =>
  useMutation({ ...options, mutationFn: (variables) => auth.mfaChallenge(variables) });

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
