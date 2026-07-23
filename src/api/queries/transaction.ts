import React from "react";
import { GetTransactions2Params, Transaction } from "@/services";
import { useApiQuery } from "@/hooks/useApiQuery";
import { apiService } from "@/services";
import { useApiReactTableQuery, UseApiReactTableQueryOptions } from "@/hooks/useApiReactTableQuery";
import { ColumnDef } from "@tanstack/react-table";
import { useSearchParams } from "next/navigation";
import { keepPreviousData } from "@tanstack/react-query";

export const TRANSACTION_KEY = {
  TRANSACTIONS: "transactions",
};

export const useGetTransactionsQuery = (query: GetTransactions2Params) =>
  useApiQuery({
    queryKey: [TRANSACTION_KEY.TRANSACTIONS, query],
    queryFn: () => apiService.getTransactions2(query),
  });

export const useGetTransactionQuery = (transactionId: string) =>
  useApiQuery({
    queryKey: [TRANSACTION_KEY.TRANSACTIONS, transactionId],
    queryFn: () => apiService.getTransaction({ transactionId }),
    enabled: !!transactionId,
  });

export const useGetTransactionsReactTableQuery = (
  columns: ColumnDef<Transaction>[],
  query?: GetTransactions2Params,
  tableOptions?: UseApiReactTableQueryOptions<Transaction>,
) => {
  const searchParams = useSearchParams();
  const status = searchParams.get("status") || "ALL";

  const filters = React.useMemo(() => {
    const queries: GetTransactions2Params = {
      ...query,
    };

    if (status !== "ALL") {
      queries.status = status;
    }

    return queries;
  }, [query, status]);

  const res = useApiReactTableQuery(
    {
      queryKey: [TRANSACTION_KEY.TRANSACTIONS, query],
      queryFn: () => apiService.getTransactions2(filters),
      placeholderData: keepPreviousData,
    },
    { columns, ...tableOptions },
  );

  return res;
};

/** Count-only query — fetches one record and reads totalRecords from the page meta. */
export const useGetTransactionsCountQuery = (query?: GetTransactions2Params, enabled = true) =>
  useApiQuery({
    queryKey: [TRANSACTION_KEY.TRANSACTIONS, "count", query],
    queryFn: () => apiService.getTransactions2({ ...query, limit: 1 }),
    enabled,
  });

export const EXTERNAL_PAYMENT_METRICS_KEY = "external-payment-metrics";

/** Someone Else Pays adoption metrics. dateRange format: "YYYY-MM-DD,YYYY-MM-DD". */
export const useGetExternalPaymentMetricsQuery = (dateRange?: string) =>
  useApiQuery({
    queryKey: [EXTERNAL_PAYMENT_METRICS_KEY, dateRange],
    queryFn: () => apiService.getExternalPaymentMetrics(dateRange ? { dateRange } : undefined),
  });
