import { useApiQuery } from "@/hooks/useApiQuery";
import { useApiReactTableQuery, UseApiReactTableQueryOptions } from "@/hooks/useApiReactTableQuery";
import { apiService, Country, GetCountriesParams, State } from "@/services";
import { ColumnDef } from "@tanstack/react-table";
import { useSearchParams } from "next/navigation";

export const SETTINGS_KEY = {
  COUNTRIES: "countries",
  STATES: "states",
};

export const useGetCountriesReactTableQuery = (
  columns: ColumnDef<Country>[],
  query?: GetCountriesParams,
  tableOptions?: UseApiReactTableQueryOptions<Country>,
) => {
  const searchParams = useSearchParams();

  const filter: GetCountriesParams = {
    page: Number(searchParams.get("page") ?? 1),
    limit: 10,
    ...query,
  };

  const res = useApiReactTableQuery(
    {
      queryKey: [SETTINGS_KEY.COUNTRIES, query],
      queryFn: () => apiService.getCountries(filter),
    },
    { columns, ...tableOptions },
  );

  return res;
};

export const useGetCountryStatesReactTableQuery = (
  countryId: string,
  columns: ColumnDef<State>[],
  tableOptions?: UseApiReactTableQueryOptions<State>,
) => {
  const res = useApiReactTableQuery(
    {
      queryKey: [SETTINGS_KEY.COUNTRIES, countryId, SETTINGS_KEY.STATES],
      queryFn: () => apiService.getCountryStates({ countryId }),
    },
    { columns, ...tableOptions },
  );

  return res;
};

export const useGetCountryQuery = (countryId: string) =>
  useApiQuery({
    queryKey: [SETTINGS_KEY.COUNTRIES, countryId],
    queryFn: () => apiService.getCountryById({ countryId }),
  });

export const useGetCountryStateQuery = (countryId: string, stateId: string) =>
  useApiQuery({
    queryKey: [SETTINGS_KEY.STATES, stateId],
    queryFn: () => apiService.getCountryStateById({ countryId, stateId }),
  });
