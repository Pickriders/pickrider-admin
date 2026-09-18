---
name: ship-check
description: Run this app's gate — type-check and lint — plus secret, generated-file, and admin-safety sweeps before committing or opening a PR. Use when finishing a task or when the user says "ready to commit" or "check this".
---

# Pre-commit check — pickrider-admin

## 1. The gate

```bash
npx tsc --noEmit
yarn lint
yarn test
```

All three clean. `yarn test` runs the jest suite (`src/**/*.test.ts(x)`); the route-contract
test in `src/lib/admin/api.test.ts` fails when an `api.ts` function has no case or its generated
method drifted. The Husky pre-commit hook runs `tsc` + lint-staged (`eslint --fix`,
`jest --findRelatedTests`) on staged files, and CI runs all three — but run them yourself before
saying the work is done.

## 2. Admin-safety review (this tool acts on production data)

Read your own diff for the things the compiler cannot catch:

- Any **destructive action** added (suspend, refund, settle, delete) — is it behind an
  `AlertDialog` confirmation?
- Any **permission-sensitive** surface — does it consult `src/lib/admin-access.ts`?
- Any **money value** rendered — is it passed through `subUnitToBaseUnit()`? The API returns
  sub-units, so a missed conversion shows staff a figure 100× wrong.
- Any **new PII** exposed that existing screens don't already show?

## 3. Generated files sweep

```bash
git status --porcelain src/services/apiService
```

`yarn dev` regenerates these on every start, so churn here is often accidental. Unless you
deliberately ran `yarn generate-types` for a contract change, revert it:
`git checkout -- src/services/apiService`. Changes to `apiService/index.ts` are legitimate
(hand-written) — just confirm they were intentional.

## 4. Secret sweep

```bash
git diff --cached --name-only | grep -E '\.env|\.pem$|\.key$' && echo "!! credentials staged"
```

Also scan the diff for inlined keys (`AIza` — this app uses Google Maps — plus `sk_`, `pk_`).
`NEXT_PUBLIC_*` values ship to the browser and are not secret; nothing else belongs client-side.

Never commit `.next/`, `out/`, or `tsconfig.tsbuildinfo`.

## 5. Committing

Only when the user asks. Branch off `dev`, PR into `dev`. If this pairs with a `backend-api`
change, that's a **separate repo** — separate commit and PR; mention the sibling in the
description.

## Report

Commands run and their actual results (including the test count). Call out anything from the
admin-safety review.
