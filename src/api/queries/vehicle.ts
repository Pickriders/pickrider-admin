import { useApiQuery } from "@/hooks/useApiQuery";
import { apiService, GetVehiclesParams } from "@/services";

export const VEHICLE_KEY = {
  VEHICLES: "vehicles",
};

export const useGetVehiclesQuery = (query: GetVehiclesParams) =>
  useApiQuery({
    queryKey: [VEHICLE_KEY.VEHICLES, query],
    queryFn: () => apiService.getVehicles(query),
  });

export const useGetVehicleQuery = (vehicleId: string) =>
  useApiQuery({
    queryKey: [VEHICLE_KEY.VEHICLES, vehicleId],
    queryFn: () => apiService.getVehicle2(vehicleId),
    enabled: !!vehicleId,
  });
