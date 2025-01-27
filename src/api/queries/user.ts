import { useApiQuery } from "@/hooks/useApiQuery";
import { apiService, GetUsersParams } from "@/services";

export const USER_KEY = {
  USER: "user",
  USERS: "users",
};

export const useGetUserQuery = () =>
  useApiQuery({
    queryKey: [USER_KEY.USER],
    queryFn: () => apiService.getUserProfile(),
  });

export const useGetUsersQuery = (query: GetUsersParams) =>
  useApiQuery({
    queryKey: [USER_KEY.USERS, query],
    queryFn: () => apiService.getUsers(query),
    // initialData,
  });
