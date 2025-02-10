import { useApiMutation } from "@/hooks/useApiMutation";
import {
  AddCountryData,
  AddCountryDto,
  AddCountryStatesData,
  AddCountryStatesPayload,
  apiService,
  queryClient,
  UpdateCountryData,
  UpdateCountryDto,
  UpdateCountryStateData,
  UpdateStateDto,
} from "@/services";
import { MutationOptions } from "@tanstack/react-query";
import { SETTINGS_KEY } from "../queries";
import { toast } from "sonner";

export const useAddCountryMn = (options?: MutationOptions<AddCountryData, any, AddCountryDto>) =>
  useApiMutation({
    ...options,
    mutationFn: (varaibles) => apiService.addCountry(varaibles),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: [SETTINGS_KEY.COUNTRIES] });
      toast.success("Country added successfully!");
      options?.onSuccess?.(data, variables, context);
    },
  });

export const useUpdateCountryMn = (
  countryId: string,
  options?: MutationOptions<UpdateCountryData, any, UpdateCountryDto>,
) =>
  useApiMutation({
    ...options,
    mutationFn: (varaibles) => apiService.updateCountry(countryId, varaibles),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: [SETTINGS_KEY.COUNTRIES] });
      toast.success("Country updated successfully!");
      options?.onSuccess?.(data, variables, context);
    },
  });

export const useAddCountryStatesMn = (
  countryId: string,
  options?: MutationOptions<AddCountryStatesData, any, AddCountryStatesPayload>,
) =>
  useApiMutation({
    ...options,
    mutationFn: (varaibles) => apiService.addCountryStates(countryId, varaibles),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: [SETTINGS_KEY.COUNTRIES, countryId] });
      toast.success("Country states added successfully!");
      options?.onSuccess?.(data, variables, context);
    },
  });

export const useUpdateCountryStateMn = (
  countryId: string,
  stateId: string,
  options?: MutationOptions<UpdateCountryStateData, any, UpdateStateDto>,
) =>
  useApiMutation({
    ...options,
    mutationFn: (varaibles) => apiService.updateCountryState(countryId, stateId, varaibles),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: [SETTINGS_KEY.COUNTRIES, countryId, SETTINGS_KEY.STATES] });
      toast.success("Country state updated successfully!");
      options?.onSuccess?.(data, variables, context);
    },
  });
