import { DefaultError, useMutation, UseMutationOptions } from "@tanstack/react-query";
import { toast } from "sonner";

export const useApiMutation = <TData = unknown, TError = DefaultError, TVariables = void, TContext = unknown>(
  options: UseMutationOptions<TData, TError, TVariables, TContext>,
) => {
  return useMutation({
    ...options,
    onError(error: any, variables, context) {
      toast.error(error.response?.data?.message ?? error?.message);
      options.onError?.(error, variables, context);
    },
  });
};
