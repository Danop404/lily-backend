# Health build metadata bounty #65

## Request

Implement the open `$75` bounty for `Lilly-Protocol/lily-backend#65` by exposing the service version and optional build commit in health diagnostics and the startup log.

## Scope and decisions

- Package version is read from the repository's `package.json`.
- Optional `BUILD_COMMIT` metadata is trimmed and omitted when absent or blank.
- Health responses include `version` and include `commit` only when configured.
- Startup logs include the same service metadata without logging unrelated or sensitive configuration.
- No dependency upgrades, credentials, payment details, or private maintainer information were added.

## Changes

- Added `src/config/service-info.ts` as the shared metadata source.
- Added optional `BUILD_COMMIT` parsing and documented it in `.env.example`.
- Added service metadata to `healthService.getStatus()` and the startup log context.
- Added unit and real HTTP-path tests in `tests/service-info.test.ts`.

## Verification

- `npm ci` completed; it reported 9 existing dependency audit findings (2 low, 1 moderate, 6 high).
- Targeted test: 1 file, 3 tests passed.
- Full `npm test`: 3 files, 9 tests passed.
- `npm run lint`: passed.
- `npm run build`: passed.
- `git diff --check`: passed.
- Real `/api/v1/health` request confirmed version and configured commit metadata in the response.

## External status

- Issue #65 was claimed without posting any payout identifier.
- Maintainer review, merge, bounty approval, and payment remain external gates.

## Useful paths and commands

- Branch: `health-build-metadata-65`
- Metadata source: `src/config/service-info.ts`
- Health service: `src/modules/health/health.service.ts`
- Startup entrypoint: `src/server.ts`
- Tests: `tests/service-info.test.ts`
- Verify: `npm test && npm run lint && npm run build && git diff --check`
