---
name: sync-api-types
description: Regenerate this app's Swagger-derived API client after a backend contract change, then fix the resulting type errors. Use when the backend API changed, when generated types look stale, or when the user says "sync types" or "regenerate types".
---

# Regenerating the API client

`src/services/apiService/` is generated from the backend's **live** Swagger document by
`swagger-typescript-api`:

`https://pickriders-api-dev.onrender.com/docs/api-json`

`Api.ts`, `ApiRoute.ts`, `data-contracts.ts`, and `http-client.ts` are generated and must never
be hand-edited. **`index.ts` is hand-written.**

Note: `yarn dev` runs this generator on every start, so the folder may already be churning
without you asking.

## 1. Confirm the backend change is actually deployed

The generator reads a live URL. Regenerating before the change reaches the dev environment
silently rewrites the client with the **old** contract while appearing to succeed.

```bash
curl -s https://pickriders-api-dev.onrender.com/docs/api-json | grep -o '<yourNewOperationId>'
```

Nothing back? Stop, and tell the user the backend must be deployed first.

## 2. Regenerate

```bash
yarn generate-types
```

## 3. Review the diff before anything else

```bash
git diff --stat src/services/apiService
```

- Expect changes **only** in `Api.ts`, `ApiRoute.ts`, `data-contracts.ts`, `http-client.ts`.
- **If `index.ts` appears in the diff, restore it:**
  `git checkout -- src/services/apiService/index.ts`
- A diff removing hundreds of routes means you generated against a stale or wrong document —
  revert the folder and return to step 1.

## 4. Fix the fallout

```bash
npx tsc --noEmit && yarn lint
```

The generated types are the contract, so type errors are real work — and with **no test suite
in this repo**, the type-checker is the only thing that will catch a break. Fix call sites in
`src/api/queries` and `src/api/mutations` and their consumers. **Never patch a generated file**
to silence an error.

Pay particular attention to `src/api/queries/analytics.ts`, which fans out over many admin list
endpoints and is therefore the most likely place to break on a contract change.

## 5. Sibling repos

`customer-app` and `rider-app` generate from the same document and are **separate git
repositories** — each needs its own `yarn generate-types` and its own commit. `web-app` uses
hand-written axios and must be updated by hand. Mention any affected; don't reach into them
from here unless asked.

## Report

Whether the backend change was confirmed live, what the diff touched, the type-check result,
and which sibling repos still need syncing.
