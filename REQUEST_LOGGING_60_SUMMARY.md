# Health and root request logging bounty #60

## Request

Implement the open `$25` bounty for `Lilly-Protocol/lily-backend#60` by skipping automatic pino-http completion/error logs for the root route and health endpoint while keeping normal route logging enabled.

## Scope and decisions

- Kept the change limited to pino-http configuration, a reusable path predicate, and tests.
- Ignored `/`, query-string variants of `/`, `/api/v1/health`, `/api/v1/health/`, and health query-string variants.
- Continued logging `/api/v1/agents`, `/api/v1/healthy`, and unrelated `/health` paths.
- Used pathname parsing so query strings do not affect the decision and similarly named paths are not accidentally suppressed.
- Did not change dependencies, credentials, payment details, or private maintainer information.

## Changes

- Added `src/config/request-logging.ts` with `shouldIgnoreRequestLog()`.
- Wired the predicate into `pinoHttp({ autoLogging.ignore })` in `src/app.ts`.
- Added `tests/request-logging.test.ts` covering ignored and retained paths.

## Verification

- `npm ci` completed; it reported 9 existing dependency audit findings (2 low, 1 moderate, 6 high).
- Targeted test: 1 file, 8 tests passed.
- Full `npm test`: 3 files, 14 tests passed.
- `npm run lint`: passed.
- `npm run build`: passed.
- `git diff --check`: passed.

## External status

- Issue #60 was checked before work; no claim or PR was present.
- Maintainer review, merge, bounty approval, and payment remain external gates.
- No payout identifier was posted.

## Useful paths and commands

- Branch: `skip-health-logging-60`
- Predicate: `src/config/request-logging.ts`
- Wiring: `src/app.ts`
- Tests: `tests/request-logging.test.ts`
- Verify: `npm test && npm run lint && npm run build && git diff --check`
