import { useApiQuery } from "@/hooks/useApiQuery";
import { useApiReactTableQuery, UseApiReactTableQueryOptions } from "@/hooks/useApiReactTableQuery";
import { apiService, GetUserOrders2Params, Order } from "@/services";
import { ColumnDef } from "@tanstack/react-table";
import { useSearchParams } from "next/navigation";
import React from "react";

export const ORDER_KEY = {
  ORDERS: "orders",
};

export const useGetOrdersReactTableQuery = (
  columns: ColumnDef<Order>[],
  query: GetUserOrders2Params,
  tableOptions?: UseApiReactTableQueryOptions<Order>,
) => {
  const searchParams = useSearchParams();
  const status = searchParams.get("status") || "ALL";
  const orderType = searchParams.get("orderType") || "ALL";

  const filters = React.useMemo(() => {
    const queries: GetUserOrders2Params = {
      page: Number(searchParams.get("page") ?? 1),
      ...query,
    };

    if (status !== "ALL") {
      queries.status = status;
    }

    if (orderType !== "ALL") {
      queries.type = orderType;
    }

    return queries;
  }, [searchParams, query]);

  const res = useApiReactTableQuery(
    {
      queryKey: [ORDER_KEY.ORDERS, filters],
      queryFn: () => apiService.getUserOrders2(filters),
    },
    { columns, ...tableOptions },
  );

  return res;
};
