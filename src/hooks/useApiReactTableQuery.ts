import { DefaultError, QueryKey, UndefinedInitialDataOptions } from "@tanstack/react-query";
import React from "react";
import { useApiQuery } from "./useApiQuery";
import { getCoreRowModel, TableOptions, useReactTable } from "@tanstack/react-table";

export type UseApiReactTableQueryOptions<TTableData> = Partial<TableOptions<TTableData>>;

export const useApiReactTableQuery = <
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TDataKey extends keyof TData = keyof TData,
  TTableData = TData[TDataKey] extends Array<infer U> ? U : never,
  TQueryKey extends QueryKey = QueryKey,
>(
  queryOptions: UndefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey>,
  tableOptions: Partial<TableOptions<TTableData>> & {
    dataKey?: TDataKey;
  },
) => {
  const [rowSelection, setRowSelection] = React.useState({});
  const res = useApiQuery(queryOptions);

  const table = useReactTable({
    data: (res.data?.[tableOptions?.dataKey ?? ("results" as keyof TData)] ?? []) as TTableData[],
    columns: tableOptions?.columns || [],
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    pageCount: (res.data?.["totalPages" as keyof TData] as number) ?? 0,
    manualPagination: true,
    state: {
      rowSelection,
    },
    ...tableOptions,
  });

  return { ...res, table, rowSelection };
};
