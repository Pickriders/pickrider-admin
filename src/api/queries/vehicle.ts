import { useApiQuery } from "@/hooks/useApiQuery";
import { apiService, GetVehiclesParams, Vehicle } from "@/services";
import { ColumnDef, TableOptions } from "@tanstack/react-table";
import { useApiReactTableQuery, UseApiReactTableQueryOptions } from "@/hooks/useApiReactTableQuery";
import { keepPreviousData } from "@tanstack/react-query";

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
    queryFn: () => apiService.getVehicle2({ vehicleId }),
    enabled: !!vehicleId,
  });

export const useGetVehiclesReactTableQuery = (
  columns: ColumnDef<Vehicle>[],
  query?: GetVehiclesParams,
  tableOptions?: UseApiReactTableQueryOptions<Vehicle>,
) => {
  const filter: GetVehiclesParams = {
    // TODO: Get filters from the url query params and set them here.
    ...query,
  };

  const res = useApiReactTableQuery(
    {
      queryKey: [VEHICLE_KEY.VEHICLES, query],
      queryFn: () => apiService.getVehicles(filter),
      placeholderData: keepPreviousData,
    },
    { columns, ...tableOptions },
  );

  return res;
};
