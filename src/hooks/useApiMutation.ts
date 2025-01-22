import { DefaultError, useMutation, UseMutationOptions } from "@tanstack/react-query";

export const useApiMutation = <TData = unknown, TError = DefaultError, TVariables = void, TContext = unknown>(
  options: UseMutationOptions<TData, TError, TVariables, TContext>
) => {

  return useMutation({
    ...options,
    onError(error, variables, context) {
      // TODO: Handle error here, same way you will do with useApiQuery.
      options.onError?.(error, variables, context);
    },
  });
};
