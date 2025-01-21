import { useApiQuery } from "@/hooks/useApiQuery";
import { apiService } from "@/services";

export const USER_KEY = {
  USERS: "users",
};


export const useGetUserQuery = () =>
  useApiQuery({
    queryKey: [USER_KEY.USERS],
    queryFn: () => apiService.getUserProfile(),
  });
