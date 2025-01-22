import { DefaultError, QueryKey, UndefinedInitialDataOptions, useQuery } from "@tanstack/react-query";
import React from "react";

export const useApiQuery = <
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UndefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey>
) => {
  const res = useQuery(options);

  React.useEffect(() => {
    if (res.error) {
      // TODO: Handle error here. 
      // Probably show a toast or something, so that you don't have to do it everywehre on the app.
    }
  }, [res.error]);

  return res;
};
