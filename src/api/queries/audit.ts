import { useApiQuery } from "@/hooks/useApiQuery";
import { apiService } from "@/services";

export const AUDIT_KEY = "audit-logs";

/** Platform audit logs (admin/system actions), paginated. */
export const useGetAuditLogsQuery = (page = 1, limit = 15) =>
  useApiQuery({
    queryKey: [AUDIT_KEY, page, limit],
    queryFn: () => apiService.findAll({ page, limit, order: "DESC" }),
  });
