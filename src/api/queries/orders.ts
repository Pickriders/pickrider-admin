import { useApiQuery } from "@/hooks/useApiQuery";
import { useApiReactTableQuery, UseApiReactTableQueryOptions } from "@/hooks/useApiReactTableQuery";
import { apiService, GetOrdersParams, Order } from "@/services";
import { ColumnDef } from "@tanstack/react-table";
import { useSearchParams } from "next/navigation";
import React from "react";

export const ORDER_KEY = {
  ORDERS: "orders",
};

export const useGetOrdersReactTableQuery = (
  columns: ColumnDef<Order>[],
  query: GetOrdersParams,
  tableOptions?: UseApiReactTableQueryOptions<Order>,
) => {
  const searchParams = useSearchParams();
  const status = searchParams.get("status") || "ALL";
  const orderType = searchParams.get("orderType") || "ALL";

  const filters = React.useMemo(() => {
    const queries: GetOrdersParams = {
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
  }, [searchParams, query, status, orderType]);

  const res = useApiReactTableQuery(
    {
      queryKey: [ORDER_KEY.ORDERS, filters],
      queryFn: () => apiService.getOrders(filters),
    },
    { columns, ...tableOptions },
  );

  return res;
};

export const useGetOrderQuery = (orderId: string) =>
  useApiQuery({
    queryKey: [ORDER_KEY.ORDERS, orderId],
    queryFn: () => apiService.getOrder({ orderId }),
    enabled: !!orderId,
  });
