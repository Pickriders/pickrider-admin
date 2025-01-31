import * as React from "react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useApiReactTableQuery, UseApiReactTableQueryOptions } from "@/hooks/useApiReactTableQuery";
import { apiService, GetUsersParams, User } from "@/services";
import { ColumnDef } from "@tanstack/react-table";
import { useSearchParams } from "next/navigation";

export const USER_KEY = {
  USER: "user",
  USERS: "users",
};

export const useGetUserQuery = () =>
  useApiQuery({
    queryKey: [USER_KEY.USER],
    queryFn: () => apiService.getUserProfile(),
  });

export const useGetUsersQuery = (query: GetUsersParams) =>
  useApiQuery({
    queryKey: [USER_KEY.USERS, query],
    queryFn: () => apiService.getUsers(query),
  });

export const useGetUsersReactTableQuery = (
  columns: ColumnDef<User>[],
  query?: GetUsersParams,
  tableOptions?: UseApiReactTableQueryOptions<User>,
) => {
  const searchParams = useSearchParams();

  const filters = React.useMemo(() => {
    const queries: GetUsersParams = {
      page: Number(searchParams.get("page") ?? 1),
      status: searchParams.get("status")?.toUpperCase(),
      limit: 5,
      role: "USER",
      isRider: "false",
      ...query,
    };

    return queries;
  }, [searchParams, query]);

  const res = useApiReactTableQuery(
    {
      queryKey: [USER_KEY.USERS, filters],
      queryFn: () => apiService.getUsers(filters),
    },
    { columns, ...tableOptions },
  );

  return res;
};
