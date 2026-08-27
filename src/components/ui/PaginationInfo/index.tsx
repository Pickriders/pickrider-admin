"use client";

interface PaginationInfoProps {
  currentPage?: number;
  perPageLimit?: number;
  totalRecords?: number;
}

/**
 * "Showing 1–10 of 240" range label for paginated tables. Derives the range from
 * the server's own pagination meta (currentPage / perPageLimit / totalRecords) so
 * it always matches the page you're on — page 2 reads "11–20", etc.
 */
export const PaginationInfo = ({ currentPage = 1, perPageLimit = 10, totalRecords = 0 }: PaginationInfoProps) => {
  if (!totalRecords) return null;
  const start = (currentPage - 1) * perPageLimit + 1;
  const end = Math.min(currentPage * perPageLimit, totalRecords);
  return (
    <p className="text-xs text-muted-foreground">
      Showing{" "}
      <span className="font-semibold text-foreground">
        {start.toLocaleString()}–{end.toLocaleString()}
      </span>{" "}
      of <span className="font-semibold text-foreground">{totalRecords.toLocaleString()}</span>
    </p>
  );
};
