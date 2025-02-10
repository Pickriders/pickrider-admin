import { DefaultError, QueryKey, UndefinedInitialDataOptions, useQuery } from "@tanstack/react-query";
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
    }
  }, [res.error]);

  return res;
};
