# Production error message redaction bounty #127

## Request

Implement the open `$85` bounty for `Lilly-Protocol/lily-backend#127` by adding regression coverage for production error-message redaction.

## Scope and decisions

- Kept the change test-only; the existing production behavior was not modified.
- Set `NODE_ENV` explicitly for each scenario so the tests do not depend on ambient environment state.
- Covered generic errors outside production, generic errors in production, and `AppError` messages in production.
- Did not include credentials, tokens, payment details, or private maintainer information.

## Changes

- Added `tests/error-redaction.test.ts`.
- Used a minimal Express app with a throwing stub route and the real `errorHandler`.
- Asserted that non-production generic errors expose their message for development diagnostics.
- Asserted that production generic errors return `Internal server error`.
- Asserted that production `AppError` messages and status codes remain available.

## Verification

- `npm ci` completed; it reported 9 existing dependency audit findings (2 low, 1 moderate, 6 high).
- `npm test -- --run tests/error-redaction.test.ts` passed: 1 file, 3 tests.
- `npm test` passed: 3 files, 9 tests.
- `npm run lint` passed.
- `npm run build` passed.
- `git diff --check` passed.

## External status

- Issue #127 was claimed without posting any payout identifier.
- PR #168 was opened from branch `production-error-redaction-127`; the current head is recorded in the root preflight record.
- PR #168 is currently open and mergeable; no maintainer review or status checks are reported yet.
- Maintainer review, merge, bounty approval, and payment remain external gates.

## Useful paths and commands

- Branch: `production-error-redaction-127`
- Test: `tests/error-redaction.test.ts`
- Summary: `ERROR_REDACTION_127_SUMMARY.md`
- Verify: `npm test && npm run lint && npm run build && git diff --check`
