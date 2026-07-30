"use client";

import * as React from "react";
import dayjs from "dayjs";
import { UI } from "@/components/ui";
import { useGetTransactionsQuery } from "@/api/queries/transaction";
import { formatMoney, subUnitToBaseUnit } from "@/utils";

const STATUS_COLOR: Record<string, string> = {
  SUCCESS: "#32BA7C",
  PROCESSING: "#F2A93B",
  FAILED: "#FF5244",
};

const destinationOf = (tx: any) => {
  const m = tx?.metadata ?? {};
  const bank = m.bankName || m.bank || m.accountName;
  const account = m.accountNumber || m.account;
  if (bank || account) return [bank, account].filter(Boolean).join(" · ");
  return tx?.description || "—";
};

export const WithdrawalsTable = () => {
  const [page, setPage] = React.useState(1);
  const { data, isLoading } = useGetTransactionsQuery({ category: "WITHDRAWAL", page, limit: 10, order: "DESC" });
  const rows = data?.results ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div>
      <div className="overflow-x-auto">
        <UI.Table>
          <UI.TableHeader>
            <UI.TableRow>
              <UI.TableHead>Reference</UI.TableHead>
              <UI.TableHead>Amount</UI.TableHead>
              <UI.TableHead>Destination</UI.TableHead>
              <UI.TableHead>Status</UI.TableHead>
              <UI.TableHead>Date</UI.TableHead>
            </UI.TableRow>
          </UI.TableHeader>
          <UI.TableBody>
            {rows.length ? (
              rows.map((tx) => (
                <UI.TableRow key={tx._id}>
                  <UI.TableCell className="font-semibold">{tx.reference || "—"}</UI.TableCell>
                  <UI.TableCell className="font-semibold">{formatMoney(subUnitToBaseUnit(tx.amount ?? 0), { currency: tx.currency })}</UI.TableCell>
                  <UI.TableCell className="max-w-[16rem] truncate">{destinationOf(tx)}</UI.TableCell>
                  <UI.TableCell>
                    <span style={{ color: STATUS_COLOR[tx.status] ?? "#64708a" }} className="font-semibold">
                      {tx.status}
                    </span>
                  </UI.TableCell>
                  <UI.TableCell className="text-nowrap">{dayjs(tx.createdAt).format("DD/MM/YY HH:mm")}</UI.TableCell>
                </UI.TableRow>
              ))
            ) : isLoading ? (
              <UI.TableLoading rowCount={8} columnCount={5} />
            ) : (
              <UI.TableRow>
                <UI.TableCell colSpan={5} className="h-24 text-center font-semibold">
                  No withdrawals yet.
                </UI.TableCell>
              </UI.TableRow>
            )}
          </UI.TableBody>
        </UI.Table>
      </div>
      <div className="mt-4 flex items-center justify-end gap-3">
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
