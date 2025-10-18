import { useApiMutation } from "@/hooks/useApiMutation";
import {
  apiService,
  queryClient,
  RejectVehicleData,
  SuspendVehicleData,
  UpdateVehicleStatusRequestDto,
  VerifyVehicleData,
} from "@/services";
import { MutationOptions } from "@tanstack/react-query";
import { VEHICLE_KEY } from "../queries";

export const useSuspendVehicleMn = (
  vehicleId: string,
  userId: string,
  options?: MutationOptions<SuspendVehicleData, any, UpdateVehicleStatusRequestDto>,
) =>
  useApiMutation({
    ...options,
    mutationFn: (varaibles) => apiService.suspendVehicle({ vehicleId, userId }, varaibles),
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({ queryKey: [VEHICLE_KEY.VEHICLES] });
      options?.onSuccess?.(data, variables, context);
    },
  });

export const useVerifyVehicleMn = (
  vehicleId: string,
  userId: string,
  options?: MutationOptions<VerifyVehicleData, any>,
) =>
  useApiMutation({
    ...options,
    mutationFn: () => apiService.verifyVehicle({ vehicleId, userId }),
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({ queryKey: [VEHICLE_KEY.VEHICLES] });
      options?.onSuccess?.(data, variables, context);
    },
  });

export const useRejectVehicleMn = (
  vehicleId: string,
  userId: string,
  options?: MutationOptions<RejectVehicleData, any, UpdateVehicleStatusRequestDto>,
) =>
  useApiMutation({
    ...options,
    mutationFn: (variables) => apiService.rejectVehicle({ vehicleId, userId }, variables),
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({ queryKey: [VEHICLE_KEY.VEHICLES] });
      options?.onSuccess?.(data, variables, context);
    },
  });
