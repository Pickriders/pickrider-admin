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
│   ├── (dashboard)/      admin, analytics, business, couriers, customers,
│   │                     delivery-price, finances, orders, vehicles
│   ├── auth/             login etc. (unauthenticated)
│   ├── layout.tsx        root layout
│   └── globals.css
├── api/{queries,mutations}   React Query hooks over the generated client
├── components/
│   ├── ui/               shadcn primitives — Button, Table, Select, DateCalender, …
│   ├── charts/           Recharts wrappers
│   ├── layouts/  common/  svg/
│   └── <Feature>Table/   OrdersTable, CouriersTable, VehiclesTable, …
├── constant/   hooks/   lib/   providers/   services/   styles/   utils/
└── middleware.ts         auth gate
```

**Auth is global, in `src/middleware.ts`** — it reads the access-token cookie and redirects to
`/auth/login?redirect=<original path>`. Do **not** re-implement auth gating per page.

---

## 4. Hard rules

1. **Never edit the generated API client.**
   `src/services/apiService/{Api,ApiRoute,data-contracts,http-client}.ts` come from
   `yarn generate-types` (which also runs on every `yarn dev`). Only `apiService/index.ts` is
   hand-written. To change them, change `backend-api` and regenerate — see `sync-api-types`.
2. **Tables are URL-driven.** Use `useApiReactTableQuery`, `useTableUrlFilter`, `useURLQuery`,
   and `useRowSelection` from `src/hooks/` so filters, pagination, and selection live in the
   query string — shareable between staff and surviving a refresh. Don't hold table state in
   local component state.
3. **Money from the API is in sub-units** (kobo/cents). Convert with `subUnitToBaseUnit()` from
   `@/utils` before display and `baseUnitToSubUnit()` before sending. This app shows balances,
   settlements, and refunds — an error here is a wrong financial figure in front of staff.
4. **Tailwind + shadcn only.** Compose classes with `cn()` from `@/lib/utils`. Reuse a primitive
   from `src/components/ui/` before writing anything bespoke; add new primitives the shadcn way.
   No Sass modules, no styled-components.
5. **Never commit secrets** — `.env*` and any credential file. Don't read, print, or inline them.
   Remember `NEXT_PUBLIC_*` values ship to the browser and are not secret; nothing else belongs
   client-side.
6. **Do not upgrade Next, React, or Tailwind** as a side effect of a task.

---

## 5. Conventions

**Data access** — React Query hooks in `src/api/queries/` and `src/api/mutations/`, built on
the local `useApiQuery` / `useApiMutation` wrappers. Export a `*_KEY` constant per domain and
invalidate it from related mutations:

```ts
export const AUDIT_KEY = "audit-logs";

export const useGetAuditLogsQuery = (page = 1, limit = 15) =>
  useApiQuery({
    queryKey: [AUDIT_KEY, page, limit],
    queryFn: () => apiService.findAll({ page, limit, order: "DESC" }),
  });
```

Never call `apiService` directly from a component — go through a hook.

**Server vs client components** — App Router with `rsc: true`. Anything using hooks, React
Query, or browser APIs needs `"use client"`. Keep the boundary as low in the tree as you can.

**Feedback** — Sonner for toasts, `PageLoading` / `TableLoading` / `Skeleton` for loading
states. Don't invent new spinner patterns.

**Formatting** — Prettier: `trailingComma: all`, print width 120. Run `yarn lint`.

---

## 6. A known trap: client-side analytics

The backend exposes **no cross-entity aggregate endpoints**, so
`src/api/queries/analytics.ts` derives every dashboard headline figure client-side — fanning
out `limit: 1` calls for counts and windowed fetches bucketed per day for the time-series
charts. It is documented as such at the top of that file.

This is fragile and chatty. **Before adding more client-side derivation, consider whether the
right fix is a new aggregate endpoint in `backend-api`** — and say so in your report rather than
quietly deepening the workaround.

---

## 7. Running

```bash
yarn dev      # http://localhost:3006 — NOTE: runs generate-types first (see below)
yarn build
```

**`yarn dev` runs `generate-types` first**, hitting the remote dev API and **rewriting
`src/services/apiService/`**, which drops unrelated churn into your working tree. To launch
without it:

```bash
npx next dev --port 3006
```

If the tree gets dirtied anyway: `git checkout -- src/services/apiService`.

The app redirects to `/auth/login` without an access-token cookie. Never start a dev server
blocking in the foreground.

---

## 8. Definition of done

```bash
npx tsc --noEmit
yarn lint
```

Both clean. **This repo has no test suite** — don't invent `yarn test` or claim tests pass. The
type-checker and lint are the only automated gates, so review your own diff for what they can't
catch: money conversions, permission checks, and destructive actions without confirmation.

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
- **`ci.yml`** — type-checks (`npx tsc --noEmit`) and lints — there is no test suite here on **every branch and every pull request** — each push (feature branches
  included, before a PR exists) and each PR regardless of its base.

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
