"use client";

import { SVG } from "@/components/svg";
import { UI } from "@/components/ui";
import { useQueryModal } from "@/hooks";
import { DataLog } from "@/services";
import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";

const LEVEL_COLORS: Record<string, string> = {
  ERROR: "#FF5244",
  DEBUG: "#DBAD0E",
  INFO: "#2282C8",
  LOG: "#32BA7C",
};

/** Extracts a short human summary from the mixed log payload. */
const summarize = (data: unknown): string => {
  if (!data || typeof data !== "object") return String(data ?? "—");
  const record = data as Record<string, unknown>;
  const candidate = record.message ?? record.name ?? record.event ?? Object.keys(record)[0];
  return String(candidate ?? "—").slice(0, 60);
};

export const makeColumns = (onPreview: (log: DataLog) => void): ColumnDef<DataLog>[] => [
  {
    header: "Source",
    accessorKey: "logType",
    cell: ({ row }) => <UI.TableUser name={row.original.logType ?? "SYSTEM"} subText={row.original.level ?? "LOG"} />,
  },
  {
    header: "Timestamp",
    accessorKey: "timestamp",
    cell: ({ row }) => (
      <div>
        <p className="text-nowrap">{dayjs(row.original.createdAt).format("DD MMM YYYY")}</p>
        <span>{dayjs(row.original.createdAt).format("HH:mm")}</span>
      </div>
    ),
  },
  {
    accessorKey: "level",
    header: () => <p className="text-center">Level</p>,
    cell: ({ row }) => (
      <div className="text-center font-semibold" style={{ color: LEVEL_COLORS[row.original.level ?? "LOG"] }}>
        {row.original.level ?? "LOG"}
      </div>
    ),
  },
  {
    header: "Summary",
    accessorKey: "resource",
    cell: ({ row }) => <p className="max-w-[16rem] truncate">{summarize(row.original.data)}</p>,
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => (
      <div>
        {row.original.level === "ERROR" ? (
          <span className="text-[#FF5244]">Error</span>
        ) : (
          <span className="text-[#32BA7C]">OK</span>
        )}
      </div>
    ),
  },
  {
    id: "query",
    cell: ({ row }) => {
      return <QueryButton log={row.original} onPreview={onPreview} />;
    },
  },
];

const QueryButton = ({ log, onPreview }: { log: DataLog; onPreview: (log: DataLog) => void }) => {
  const setParam = useQueryModal([{ key: "jsonPreview", value: true }]).setParam;

  const handlePreview = () => {
    onPreview(log);
    setParam("jsonPreview", "true");
  };

  return (
    <UI.Button onClick={handlePreview} variant={"ghost"} className="text-[#2282C8] hover:text-[#2282C8]">
      <SVG.SearchListIcon />
      Query
    </UI.Button>
  );
};
