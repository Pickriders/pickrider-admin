import { DefaultError, QueryKey, UndefinedInitialDataOptions, useQuery } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import React from "react";
import { toast } from "sonner";

export const useApiQuery = <
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UndefinedInitialDataOptions<TQueryFnData, TError | any, TData, TQueryKey>,
) => {
  const res = useQuery(options);

  React.useEffect(() => {
    if (res.error) {
      toast.error(res.error.response?.data?.message || res.error.message);
      if (res.error.response?.status === 404) {
        notFound();
      }
    }
  }, [res.error]);

  return res;
};
