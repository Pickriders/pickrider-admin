import { useApiQuery } from "@/hooks/useApiQuery";
import { useApiReactTableQuery, UseApiReactTableQueryOptions } from "@/hooks/useApiReactTableQuery";
import { apiService, Country, GetCountriesParams } from "@/services";
import { ColumnDef } from "@tanstack/react-table";
import { useSearchParams } from "next/navigation";

export const COUNTRY_KEY = {
  COUNTRIES: "countries",
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
      queryKey: [COUNTRY_KEY.COUNTRIES, query],
      queryFn: () => apiService.getCountries(filter),
    },
    { columns, ...tableOptions },
  );

  return res;
};

export const useGetCountryQuery = (countryId: string) =>
  useApiQuery({
    queryKey: [COUNTRY_KEY.COUNTRIES, countryId],
    queryFn: () => apiService.getCountryById({ countryId }),
  });
