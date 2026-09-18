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

## 2. The data layer — three files, always

Never call `apiService` from the page. Every route gets:

1. A namespace function in `src/lib/admin/api.ts` on the **generated** client (check the method
   name in `src/services/apiService/Api.ts`; if the route is missing, the backend change is not
   in the client yet — see `sync-api-types`). Type the response off `data-contracts.ts`.
2. A route case in `src/lib/admin/api.test.ts` (verb, path, query, body). The suite fails until
   it exists.
3. A hook in `src/lib/admin/hooks.ts` — `useQuery` for reads, `useAction` for writes (it toasts
   and invalidates).

```ts
// api.ts
export const settlements = {
  list: (query: Query) => page<Settlement>(apiService.listSettlements(params(query))),
  approve: (id: string) => apiService.approveSettlement(id),
};
// api.test.ts
{ name: "settlements.list", call: () => api.settlements.list({ page: 1 }), method: "GET", path: `${P}/admins/settlements`, params: { page: "1" }, paged: true },
// hooks.ts
export const useSettlements = (query: Query) => useQuery({ queryKey: ["settlements", query], queryFn: () => settlements.list(query), ...keep });
```

## 3. The table — keep state in the URL

`useTableState({ limit })` from `src/lib/admin/url-state.ts` owns page/limit/sort/search/filters
in the query string; `useTabParam` owns the tab. Feed it to the kit `DataTable` (columns via
`ColumnDef` + `meta()` for sort keys, CSV and responsive hiding; `filters` for select chips;
`toolbarExtra` for buttons; `mobileCard` for phones). Open a row's drawer with
`table.update({ id })` so the URL is shareable. Copy `src/app/(dashboard)/orders/_components/`
or `messaging/_components/announcements-tab.tsx` rather than assembling one from scratch.

## 4. UI

Tailwind + the kit (`src/components/kit/`): `PageHeader`, `Panel`/`PanelHeader`, `StatCard`,
`Badge`, `Button`, `Drawer`, `ConfirmDialog`, `Field`/`Input`/`Select`/`Textarea`, `Skeleton`,
`EmptyState`, composed with `cx()`. Sonner for toasts (via `useAction`). Gate write buttons with
`useCan()` and a new `ACTION_ROLES` entry in `src/lib/admin-access.ts`.

**Money columns**: values from the API are in sub-units — run them through
`subUnitToBaseUnit()` from `@/utils` before rendering.

**Destructive actions** (suspend, refund, settle, delete) must go behind an `AlertDialog`
confirmation, and should respect `src/lib/admin-access.ts` permissions.

## 5. Navigation

Add the page to the dashboard navigation in `src/components/layouts/` so it's reachable, and
add a breadcrumb via `BreadCrumb` / `BreadCrumbNav` if the area uses them.

## 6. Finish

```bash
npx tsc --noEmit && yarn lint && yarn test
```

Report the new route and whether any needed data is missing from the API (a new backend
endpoint beats client-side derivation).
