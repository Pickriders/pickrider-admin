---
name: new-admin-page
description: Scaffold a new admin dashboard page with the correct App Router placement, URL-driven table wiring, shadcn primitives, and API hooks. Use when adding a new section or listing screen to the admin.
---

# New admin page

## 1. Route placement

Authenticated pages live under `src/app/(dashboard)/<area>/`:

```
src/app/(dashboard)/settlements/
├── page.tsx
└── [id]/page.tsx        ← detail view, if needed
```

`src/middleware.ts` already gates everything outside `/auth` on the access-token cookie —
**do not add your own auth check**. Add `"use client"` at the top of any page using hooks,
React Query, or browser APIs.

## 2. The data hook

Never call `apiService` from the page. Add a hook in `src/api/queries/<domain>.ts`:

```ts
import { useApiQuery } from "@/hooks/useApiQuery";
import { apiService } from "@/services";

export const SETTLEMENT_KEY = "settlements";

export const useGetSettlementsQuery = (page = 1, limit = 15) =>
  useApiQuery({
    queryKey: [SETTLEMENT_KEY, page, limit],
    queryFn: () => apiService.getSettlements({ page, limit, order: "DESC" }),
  });
```

Mutations go in `src/api/mutations/` and invalidate `[SETTLEMENT_KEY]` in `onSuccess`.
Export both from the `src/api` barrel.

## 3. The table — keep state in the URL

Use the existing hooks so filters, pagination, and selection are shareable and survive refresh:

- `useApiReactTableQuery` — pairs a React Query fetch with TanStack Table state
- `useTableUrlFilter` — filter state in the query string
- `useURLQuery` — read/write query params
- `useRowSelection` — bulk-selection state

Copy an existing table (`src/components/OrdersTable/`, `CouriersTable/`, `VehiclesTable/`)
rather than assembling one from scratch. Reuse `TableSearchInput`, `TableFilter`,
`TableStatus`, `PaginationBtns`, `PaginationInfo`, and `TableLoading` from
`src/components/ui/`.

## 4. UI

Tailwind + shadcn primitives from `src/components/ui/`, composed with `cn()` from
`@/lib/utils`. `SectionHeader` / `PrimaryHeading` for headers, `Skeleton` / `PageLoading` for
loading, Sonner for toasts.

**Money columns**: values from the API are in sub-units — run them through
`subUnitToBaseUnit()` from `@/utils` before rendering.

**Destructive actions** (suspend, refund, settle, delete) must go behind an `AlertDialog`
confirmation, and should respect `src/lib/admin-access.ts` permissions.

## 5. Navigation

Add the page to the dashboard navigation in `src/components/layouts/` so it's reachable, and
add a breadcrumb via `BreadCrumb` / `BreadCrumbNav` if the area uses them.

## 6. Finish

```bash
npx tsc --noEmit && yarn lint
```

No test suite exists here — don't claim tests. Report the new route and whether any needed data
is missing from the API (a new backend endpoint often beats more client-side derivation).
