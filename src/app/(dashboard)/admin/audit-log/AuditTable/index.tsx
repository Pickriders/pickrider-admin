"use client";

import * as React from "react";
import dayjs from "dayjs";
import { UI } from "@/components/ui";
import { useGetAuditLogsQuery } from "@/api/queries/audit";

const TYPE_COLOR: Record<string, string> = {
  ADMIN: "#3FA49F",
  BUSINESS: "#7C3AED",
  DEVELOPER: "#2282C8",
  SYSTEM: "#64708a",
  USER: "#DBAD0E",
};

const METHOD_COLOR: Record<string, string> = {
  GET: "#2282C8",
  POST: "#32BA7C",
  PATCH: "#DBAD0E",
  PUT: "#DBAD0E",
  DELETE: "#FF5244",
};

export const AuditTable = () => {
  const [page, setPage] = React.useState(1);
  const { data, isLoading } = useGetAuditLogsQuery(page);
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="rounded-2xl border bg-card">
      <div className="w-full overflow-x-auto">
        <UI.Table>
          <UI.TableHeader>
            <UI.TableRow>
              <UI.TableHead>Action</UI.TableHead>
              <UI.TableHead>Source</UI.TableHead>
              <UI.TableHead>Method</UI.TableHead>
              <UI.TableHead>Endpoint</UI.TableHead>
              <UI.TableHead>Result</UI.TableHead>
              <UI.TableHead>IP</UI.TableHead>
              <UI.TableHead>Time</UI.TableHead>
            </UI.TableRow>
          </UI.TableHeader>
          <UI.TableBody>
            {data?.results?.length ? (
              data.results.map((log) => (
                <UI.TableRow key={log._id}>
                  <UI.TableCell className="max-w-[18rem]">
                    <span className="font-semibold text-foreground">{log.action || "—"}</span>
                  </UI.TableCell>
                  <UI.TableCell>
                    <span
                      className="rounded-full px-2 py-0.5 text-[11px] font-bold"
                      style={{ color: TYPE_COLOR[log.actionType] ?? "#64708a", backgroundColor: `${TYPE_COLOR[log.actionType] ?? "#64708a"}1a` }}
                    >
                      {log.actionType}
                    </span>
                  </UI.TableCell>
                  <UI.TableCell>
                    <span className="font-semibold" style={{ color: METHOD_COLOR[log.requestMethod ?? ""] ?? "#64708a" }}>
                      {log.requestMethod || "—"}
                    </span>
                  </UI.TableCell>
                  <UI.TableCell className="max-w-[18rem] truncate text-xs">{log.requestUrl || "—"}</UI.TableCell>
                  <UI.TableCell>
                    {log.actionSuccessful === false ? (
                      <span className="text-red-500">Failed</span>
                    ) : (
                      <span className="text-emerald-600">OK</span>
                    )}
                  </UI.TableCell>
                  <UI.TableCell className="text-xs">{log.ipAddress || "—"}</UI.TableCell>
                  <UI.TableCell className="text-nowrap text-xs">
                    {dayjs(log.createdAt).format("DD/MM/YY HH:mm")}
                  </UI.TableCell>
                </UI.TableRow>
              ))
            ) : isLoading ? (
              <UI.TableLoading rowCount={12} columnCount={7} />
            ) : (
              <UI.TableRow>
                <UI.TableCell colSpan={7} className="h-24 text-center font-semibold">
                  No audit logs.
                </UI.TableCell>
              </UI.TableRow>
            )}
          </UI.TableBody>
        </UI.Table>
      </div>

      <div className="flex items-center justify-end gap-3 p-4">
        <UI.Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          Previous
        </UI.Button>
        <span className="text-xs font-semibold text-muted-foreground">
          {page} / {Math.max(totalPages, 1)}
        </span>
        <UI.Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
          Next
        </UI.Button>
      </div>
    </div>
  );
};
