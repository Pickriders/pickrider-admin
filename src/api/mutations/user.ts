import { MutationOptions } from "@tanstack/react-query";
import {
  apiService,
  ChangePasswordRequestDto,
  ChangeUserPasswordData,
  CreateUserData,
  CreateUserParams,
  CreateUserRequestDto,
  queryClient,
  SubmitDriversLicenseRequestDto,
  UpdateEmailData,
  UpdateEmailRequestDto,
  UpdatePhoneNumberData,
  UpdatePhoneRequestDto,
  UpdatePhotoRequestDto,
  UpdateProfilePhotoData,
  UpdateProfileRequestDto,
  UpdateUserProfileData,
} from "@/services";
import { USER_KEY } from "../queries/user";
import _ from "lodash";
import { useApiMutation } from "@/hooks/useApiMutation";
import { toast } from "sonner";

export const useRegisterMn = (
  query: CreateUserParams,
  options?: MutationOptions<CreateUserData, any, CreateUserRequestDto>,
) =>
  useApiMutation({
    ...options,
    mutationFn: (varaibles) => apiService.createUser(query, varaibles),
  });

export const useVerifyDriversLicenseMn = (
  userId: string,
  options?: MutationOptions<object, any, SubmitDriversLicenseRequestDto>,
) =>
  useApiMutation({
    ...options,
    mutationFn: (varaibles) => apiService.verifyDriversLicense2({ userId }, varaibles),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: [USER_KEY.USER] });
      queryClient.invalidateQueries({ queryKey: [USER_KEY.USERS] });

      options?.onSuccess?.(data, variables, context);
      toast.success("License verified successfully!");
    },
  });

/** Reject / disapprove (or otherwise re-status) a courier's driver's licence. */
export const useUpdateDriversLicenseMn = (userId: string, options?: { onSuccess?: () => void }) =>
  useApiMutation({
    mutationFn: (variables: { status: "APPROVE" | "DISAPPROVE" | "SUSPENDED" | "SUBMITTED" | "PENDING"; comment?: string }) =>
      apiService.updateDriversLicense({ userId }, variables as never),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USER_KEY.USER] });
      queryClient.invalidateQueries({ queryKey: [USER_KEY.USERS] });
      options?.onSuccess?.();
    },
  });

export const useUpdateUserProfileMn = (
  options?: MutationOptions<UpdateUserProfileData, any, UpdateProfileRequestDto>,
) =>
  useApiMutation({
    ...options,
    mutationFn: (varaibles) => apiService.updateUserProfile(varaibles),
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({ queryKey: [USER_KEY.USERS] });
      options?.onSuccess?.(data, variables, context);
    },
  });

export const useUpdateUserEmailMn = (options?: MutationOptions<UpdateEmailData, any, UpdateEmailRequestDto>) =>
  useApiMutation({
    ...options,
    mutationFn: (varaibles) => apiService.updateEmail(varaibles),
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({ queryKey: [USER_KEY.USERS] });
      options?.onSuccess?.(data, variables, context);
    },
  });

export const useUpdateUserPhoneMn = (options?: MutationOptions<UpdatePhoneNumberData, any, UpdatePhoneRequestDto>) =>
  useApiMutation({
    ...options,
    mutationFn: (varaibles) => apiService.updatePhoneNumber(varaibles),
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({ queryKey: [USER_KEY.USERS] });
      options?.onSuccess?.(data, variables, context);
    },
  });

export const useUpdateUserProfilePhotoMn = (
  options?: MutationOptions<UpdateProfilePhotoData, any, UpdatePhotoRequestDto>,
) =>
  useApiMutation({
    ...options,
    mutationFn: (varaibles) => apiService.updateProfilePhoto(varaibles),
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({ queryKey: [USER_KEY.USERS] });
      options?.onSuccess?.(data, variables, context);
    },
  });

export const useChangeUserPasswordMn = (
  options?: MutationOptions<ChangeUserPasswordData, any, ChangePasswordRequestDto>,
) =>
  useApiMutation({
    ...options,
    mutationFn: (varaibles) => apiService.changeUserPassword(varaibles),
  });
