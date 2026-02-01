import { useApiQuery } from "@/hooks/useApiQuery";
import { useApiReactTableQuery, UseApiReactTableQueryOptions } from "@/hooks/useApiReactTableQuery";
import { apiService, GetCountryStatesParams, State } from "@/services";
import { ColumnDef } from "@tanstack/react-table";
import { useSearchParams } from "next/navigation";

export const STATE_KEY = {
  STATES: "states",
};

export const useGetCountryStateQuery = (countryId: string, stateId: string) =>
  useApiQuery({
    queryKey: [STATE_KEY.STATES, stateId],
    queryFn: () => apiService.getCountryStateById({ countryId, stateId }),
  });

export const useGetCountryStatesReactTableQuery = (
  columns: ColumnDef<State>[],
  query?: GetCountryStatesParams,
  tableOptions?: UseApiReactTableQueryOptions<State>,
) => {
  const searchParams = useSearchParams();

  const filter: GetCountryStatesParams = {
    countryId: query?.countryId ?? "",
  };

  const res = useApiReactTableQuery(
    {
      queryKey: [STATE_KEY.STATES, query],
      queryFn: () => apiService.getCountryStates(filter),
    },
    { columns, ...tableOptions },
  );

  return res;
};
