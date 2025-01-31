import { DefaultError, QueryKey, UndefinedInitialDataOptions } from "@tanstack/react-query";
import React from "react";
import { useApiQuery } from "./useApiQuery";
import { ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table";

export const useApiReactTableQuery = <
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TDataKey extends keyof TData = keyof TData,
  TTableData = TData[TDataKey] extends Array<infer U> ? U : never,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UndefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey> & {
    columns: ColumnDef<TTableData>[];
    dataKey?: TDataKey;
  },
) => {
  const [rowSelection, setRowSelection] = React.useState({});
  const res = useApiQuery(options);

  const table = useReactTable({
    data: (res.data?.[options.dataKey ?? ("results" as keyof TData)] ?? []) as TTableData[],
    columns: options.columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
  });

  return { ...res, table, rowSelection };
};
