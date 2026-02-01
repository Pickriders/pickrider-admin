import { useApiMutation } from "@/hooks/useApiMutation";
import {
  AddCountryData,
  AddCountryDto,
  apiService,
  queryClient,
  UpdateCountryData,
  UpdateCountryDto,
} from "@/services";
import { MutationOptions } from "@tanstack/react-query";
import { COUNTRY_KEY } from "../queries/country";
import { toast } from "sonner";

export const useAddCountryMn = (options?: MutationOptions<AddCountryData, any, AddCountryDto>) =>
  useApiMutation({
    ...options,
    mutationFn: (varaibles) => apiService.addCountry(varaibles),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: [COUNTRY_KEY.COUNTRIES] });
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
    mutationFn: (varaibles) => apiService.updateCountry({ countryId }, varaibles),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: [COUNTRY_KEY.COUNTRIES] });
      toast.success("Country updated successfully!");
      options?.onSuccess?.(data, variables, context);
    },
  });
