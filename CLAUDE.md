# pickrider-admin — Rules for Claude

The Pickriders **internal admin dashboard** — staff manage orders, customers, couriers,
vehicles, finances, and platform config here.

**Stack:** Next.js 14 (**App Router**), React 18, TypeScript, Tailwind CSS, shadcn/ui
(`new-york` style, zinc base, Lucide icons), TanStack React Query + React Table, Recharts,
Formik/Yup, `@vis.gl/react-google-maps`, `next-themes`, Sonner (toasts).

**Path alias:** `@/*` → `src/*`.

---

## 1. Sibling repos — you are one of five

This app is checked out alongside four **separate git repositories**: `backend-api` (NestJS —
the only thing that talks to the database), `customer-app` and `rider-app` (Expo/React Native),
and `web-app` (the public marketing site). No monorepo, no workspace linking — each has its own
`node_modules` and its own remote.

**Do not confuse this repo with `web-app`.** It is also Next.js, but it is Next 13 **Pages
Router** with **Sass** and no Tailwind. Idioms do not transfer in either direction.

---

## 2. This is an internal admin tool — act accordingly

Everything here operates on **real production customer, courier, and financial data**. That
changes the risk profile of ordinary-looking work:

- Destructive admin actions (suspending accounts, refunds, settlements, deleting records) must
  have a confirmation step. Use `AlertDialog` from `src/components/ui/` — don't ship a bare
  one-click destructive button.
- Don't add new surfaces that dump PII beyond what the existing screens already show.
- Permission logic belongs in `src/lib/admin-access.ts`. Check it rather than assuming every
  admin can do everything.
- Never point this app at production data during local testing without the user explicitly
  saying so.

---

## 3. Structure

```
src/
├── app/
│   ├── (dashboard)/      achievements, admin, analytics, business, coupons, couriers,
│   │                     customers, dashboard, delivery-price, finances, messaging,
│   │                     orders, support, vehicles — each with `_components/` tabs
│   ├── auth/             login etc. (unauthenticated)
│   ├── layout.tsx        root layout
│   └── globals.css
├── services/apiService/  GENERATED swagger client (`apiService`) + hand-written index.ts
├── lib/admin/
│   ├── api.ts            typed namespaces (users, orders, coupons, announcements, …) —
│   │                     every function delegates to a generated apiService method
│   ├── api.test.ts       route contract: verb + path + query + body per namespace function
│   ├── hooks.ts          React Query hooks over api.ts (`useAction` = mutation + toast)
│   ├── http.ts           errorMessage()
│   ├── url-state.ts      useTableState / useTabParam — table + tab state in the URL
│   └── format.ts         naira/count/when/… display helpers
├── lib/admin-access.ts   role matrix: SECTION_ACCESS, ACTION_ROLES, can()
├── components/kit/       the admin's own primitives — Panel, Button, Badge, DataTable,
│                         Drawer, ConfirmDialog, StatCard, UserPicker, charts
├── components/ui/        shadcn primitives (older screens)
├── api/mutations/auth.ts auth flows (OTP, reset) on the generated client
├── constant/   hooks/   providers/   styles/   utils/
└── middleware.ts         auth gate
```

**Auth is global, in `src/middleware.ts`** — it reads the access-token cookie and redirects to
`/auth/login?redirect=<original path>`. Do **not** re-implement auth gating per page.

---

## 4. Hard rules

1. **Never edit the generated API client, and never bypass it.**
   `src/services/apiService/{Api,ApiRoute,data-contracts,http-client}.ts` come from
   `yarn generate-types` (which also runs on every `yarn dev`, exactly like `yarn start` in
   customer-app and rider-app). Only `apiService/index.ts` is hand-written (bearer token +
   401 redirect). To change a route, change `backend-api` and regenerate — see the
   `sync-api-types` skill. **No hand-written axios calls**: every request goes through a
   generated `apiService.<method>()`, wrapped in a namespace in `src/lib/admin/api.ts` so a
   route the backend renames fails `tsc` instead of 404ing in front of staff.
2. **Every `api.ts` function gets a line in `src/lib/admin/api.test.ts`.** The test fails if a
   namespace function has no route case, so a new endpoint cannot ship without pinning its
   verb, path, query and body. New namespaces should type themselves straight off
   `data-contracts.ts` (see `announcements`) rather than re-declaring the DTO by hand.
3. **Tables are URL-driven.** Use `useTableState` / `useTabParam` from `src/lib/admin/url-state.ts`
   with the kit `DataTable` so filters, pagination and the open drawer (`?id=`) live in the
   query string — shareable between staff and surviving a refresh. Don't hold table state in
   local component state.
4. **Money from the API is in sub-units** (kobo/cents). Convert with `subUnitToBaseUnit()` from
   `@/utils` before display and `baseUnitToSubUnit()` before sending. This app shows balances,
   settlements, and refunds — an error here is a wrong financial figure in front of staff.
5. **Tailwind + the kit.** Compose classes with `cx()` from `@/components/kit` (or `cn()` from
   `@/lib/utils` on older screens). Reuse a primitive from `src/components/kit/` (then
   `src/components/ui/`) before writing anything bespoke. No Sass modules, no styled-components.
6. **Never commit secrets** — `.env*` and any credential file. Don't read, print, or inline them.
   Remember `NEXT_PUBLIC_*` values ship to the browser and are not secret; nothing else belongs
   client-side.
7. **Do not upgrade Next, React, or Tailwind** as a side effect of a task.

---

## 5. Conventions

**Data access** — three layers, never skipped:

```ts
// 1. src/lib/admin/api.ts — a namespace function per route, on the generated client
export const announcements = {
  list: (query: Query) => page<Announcement>(apiService.adminListAnnouncements(params(query))),
  setStatus: (id: string, status: AnnouncementStatus) => apiService.adminUpdateAnnouncementStatus(id, { status }),
};
// 2. src/lib/admin/api.test.ts — its route case
{ name: "announcements.setStatus", call: () => api.announcements.setStatus(ID, "ACTIVE"), method: "PATCH", path: `${P}/admins/announcements/${ID}/status`, data: { status: "ACTIVE" } },
// 3. src/lib/admin/hooks.ts — the React Query hook the page uses
export const useAnnouncements = (query: Query) => useQuery({ queryKey: ["announcements", query], queryFn: () => announcements.list(query), ...keep });
```

Mutations use `useAction(fn, { success, invalidate, onSuccess })` from hooks.ts — it toasts and
invalidates for you. Never call `apiService` or an `api.ts` namespace directly from a component.

**Permissions** — add an entry to `ACTION_ROLES` in `src/lib/admin-access.ts` and gate the
button with `const { can } = useCan(); can("announcement.manage")`. The backend is the real
guard; this only hides what a role cannot do.

**In-app announcements** — the Messaging page's Announcements tab writes "what's new" popups
for the customer and rider apps. Internal deep links are picked from the screen registry the
backend serves (`GET admins/announcements/screens`, source: `backend-api/src/announcements/app-screens.ts`).
Nothing here needs updating when an app gains a screen — that list lives in the backend.

**Server vs client components** — App Router with `rsc: true`. Anything using hooks, React
Query, or browser APIs needs `"use client"`. Keep the boundary as low in the tree as you can.

**Feedback** — Sonner for toasts, `PageLoading` / `TableLoading` / `Skeleton` for loading
states. Don't invent new spinner patterns.

**Formatting** — Prettier: `trailingComma: all`, print width 120. Run `yarn lint`.

---

## 6. Aggregates come from the backend

Dashboard headline figures, series and leaderboards come from `admins/stats/*`
(`stats.*` in `api.ts`) and each feature's `summary` endpoint (`coupons.summary`,
`issues.summary`, `announcements.summary`, …). The old client-side fan-out
(`src/api/queries/analytics.ts`) is gone. **Do not bring it back**: if a page needs a number the
API does not give, add an aggregate endpoint in `backend-api` and say so in your report rather
than deriving it from list calls.

---

## 7. Running

```bash
yarn dev      # http://localhost:3006 — NOTE: runs generate-types first (see below)
yarn build
```

**`yarn dev` runs `generate-types` first** (the same convention as customer-app and rider-app),
hitting the **deployed dev API** and rewriting `src/services/apiService/`. That is the point:
the client is always the deployed contract. Two consequences:

- A backend change that is not deployed yet is not in the client. To build against it, dump the
  local backend's document and generate from that instead:
  `cd ../backend-api && yarn swagger:dump` then here `yarn generate-types:local`.
- If the regenerated client drops routes you rely on, the deployed API is behind your backend
  branch — `git checkout -- src/services/apiService` and use the local recipe above.

`yarn dev:offline` skips the regeneration when you just need the UI up.

The app redirects to `/auth/login` without an access-token cookie. Never start a dev server
blocking in the foreground.

---

## 8. Definition of done

```bash
npx tsc --noEmit
yarn lint
yarn test
```

All three clean. Jest (`jest.config.js`, via `next/jest`) runs `src/**/*.test.ts(x)`; the
route-contract test in `src/lib/admin/api.test.ts` is the one that catches API drift. The
pre-commit hook (`.husky/pre-commit`) runs `tsc`, then lint-staged: `eslint --fix` and
`jest --findRelatedTests` on the staged files — the same shape as backend-api's hook. CI
(`.github/workflows/ci.yml`) runs all three on every push and PR.

Still review your own diff for what tooling can't catch: money conversions, permission checks,
and destructive actions without confirmation.

Branch off `dev`; PR into `dev`. Commit only when asked. Never commit `.next/`, `out/`, or
`tsconfig.tsbuildinfo`.

---

## 9. Branching and CI (automated)

**Promotion chain:** `feature → dev → staging → main`.

Two GitHub Actions workflows in `.github/workflows/` run this:

- **`release-pr.yml`** — when a PR merges into `dev` it opens or refreshes
  **`release: staging ← dev`**; when a PR merges into `staging` it opens or refreshes
  **`release: main ← staging`**. It never opens a duplicate — if the release PR is already
  open, it regenerates the description instead. Only *merged* PRs promote; closing one without
  merging does nothing. It can also be run by hand from the Actions tab (`workflow_dispatch`)
  to refresh either chain.
- **`ci.yml`** — type-checks (`npx tsc --noEmit`), lints and runs `yarn test` on **every branch
  and every pull request** — each push (feature branches included, before a PR exists) and each
  PR regardless of its base.

**`.github/scripts/release-notes.sh`** builds the release PR description. It lists **squash-merged
pull requests only** — author name and commit title — because a squash merge is the one thing
that maps cleanly to "one PR, one line". It detects them as single-parent commits whose subject
GitHub suffixed with the PR number (`feat(wallet): funding terms (#207)`). Merge commits and
direct pushes are counted and collapsed underneath so the totals still reconcile, but they are
not the headline list. Run it locally the same way CI does:

```bash
bash .github/scripts/release-notes.sh dev staging https://github.com/Pickriders/pickrider-admin
```

**Two things to know:**

1. **A release PR opened with the default `GITHUB_TOKEN` does not trigger `pull_request`
   workflows** — GitHub suppresses those events to prevent recursion. That is why `ci.yml` also
   runs on **push** to every branch: the promoted code is verified either way. To get
   checks displayed on the release PR itself, add a PAT as the `RELEASE_PR_TOKEN` secret; the
   workflow uses it automatically when present.
2. **Squash-merge feature PRs into `dev`** if you want them itemised in the release notes. The
   repo's history currently mixes squash merges, merge commits, and direct pushes — only the
   first appears in the headline list.

---

## 10. Keeping this file current

When an engineer corrects your approach, or you find a convention that isn't written down,
update this file. The corrected approach becomes the standard.

Project-local agents and skills live in `.claude/` — see `.claude/skills/` for
`sync-api-types`, `new-admin-page`, and `ship-check`.
