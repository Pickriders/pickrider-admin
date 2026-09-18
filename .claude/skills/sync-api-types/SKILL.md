---
name: sync-api-types
description: Regenerate this app's Swagger-derived API client after a backend contract change, then fix the resulting type errors and route-contract tests. Use when the backend API changed, when generated types look stale, or when the user says "sync types" or "regenerate types".
---

# Regenerating the API client

`src/services/apiService/` is generated from the backend's Swagger document by
`swagger-typescript-api@13.0.23` (same version and flags as customer-app and rider-app).
`Api.ts`, `ApiRoute.ts`, `data-contracts.ts` and `http-client.ts` are generated and must never
be hand-edited. **`index.ts` is hand-written** (bearer token + 401 redirect).

Every admin page reaches the client through the namespaces in `src/lib/admin/api.ts`, and every
namespace function has a route case in `src/lib/admin/api.test.ts`. A regeneration therefore
surfaces drift in two places: `tsc` (a method vanished or changed shape) and `yarn test` (a
method now points at a different route or drops a query/body).

## 1. Decide which document to generate from

- **Deployed dev API** (the default, what `yarn dev` does):
  `yarn generate-types` reads `https://pickriders-api-dev.onrender.com/docs/api-json`.
  Only correct once the backend change is deployed there. Check first:
  `curl -s https://pickriders-api-dev.onrender.com/docs/api-json | grep -o '<newOperationId>'`
- **Local backend branch** (a change not deployed yet):
  `cd ../backend-api && yarn swagger:dump` writes `swagger.json` there, then
  `yarn generate-types:local` here reads it. Compare path counts against the deployed document
  before trusting it — the local branch must be a superset, or you are regressing the client.

## 2. Regenerate, then review the diff

```bash
git diff --stat src/services/apiService
```

- Changes only in the four generated files. **If `index.ts` appears, restore it:**
  `git checkout -- src/services/apiService/index.ts`
- Hundreds of removed routes means a stale or wrong document — revert the folder, return to step 1.
- A method that gained a numeric suffix (`cancelOrder2`) means two backend handlers share a name.
  Fix the backend (`src/swagger.operation-ids.spec.ts` there enforces uniqueness); never adopt
  the suffixed name here.

## 3. Fix the fallout

```bash
npx tsc --noEmit && yarn lint && yarn test
```

- `tsc` errors in `src/lib/admin/api.ts`: point the namespace function at the renamed method or
  the new parameter shape. Path+query methods take one object (`{ userId, ...query }`); pass it
  through `params({ ...query, userId })`.
- `api.test.ts` failures: the generated method now hits a different route or lost a query/body.
  Decide whether the backend contract or the admin call is wrong — a body the generated method
  no longer accepts is being **silently dropped**, so fix the backend's `@ApiBody`/DTO or
  `@ApiQuery` rather than casting around it.
- A new endpoint: add the namespace function **and** its route case, then the hook.

**Never patch a generated file** to silence an error.

## 4. Sibling repos

`customer-app` and `rider-app` generate from the same document and are **separate git
repositories** — each needs its own `yarn generate-types` and its own commit. `web-app` uses
hand-written axios and must be updated by hand. Mention any affected; don't reach into them
from here unless asked.

## Report

Which document you generated from (deployed or local dump), what the diff touched, the
type-check/test result, and which sibling repos still need syncing.
