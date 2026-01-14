import { useApiMutation } from "@/hooks/useApiMutation";
import {
  AddCountryStatesData,
  AddCountryStatesPayload,
  apiService,
  queryClient,
  UpdateCountryStateData,
  UpdateStateDto,
} from "@/services";
import { MutationOptions } from "@tanstack/react-query";
import { STATE_KEY } from "../queries/state";
import { toast } from "sonner";

export const useAddCountryStatesMn = (
  countryId: string,
  options?: MutationOptions<AddCountryStatesData, any, AddCountryStatesPayload>,
) =>
  useApiMutation({
    ...options,
    mutationFn: (varaibles) => apiService.addCountryStates({ countryId }, varaibles),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: [STATE_KEY.STATES, countryId] });
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
    mutationFn: (varaibles) => apiService.updateCountryState({ countryId, stateId }, varaibles),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: [STATE_KEY.STATES, countryId, STATE_KEY.STATES] });
      toast.success("Country state updated successfully!");
      options?.onSuccess?.(data, variables, context);
    },
  });
