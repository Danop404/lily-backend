# Security headers bounty #135

## Request

Restart the open-source bounty workflow from a fresh target and implement the scoped security-header test task for `Lilly-Protocol/lily-backend#135`.

## Scope and decisions

- Target: `Lilly-Protocol/lily-backend#135`, marked `$90` and open when claimed.
- Scope stayed limited to response-header assertions; no production middleware behavior was changed.
- The test documents the intentional `cross-origin` Cross-Origin-Resource-Policy override.
- No payment details, tokens, credentials, or private maintainer information were added to the repository.

## Changes

- Added a Supertest regression test for `GET /api/v1/health`.
- Asserted `X-Content-Type-Options: nosniff`.
- Asserted Helmet's `X-Frame-Options: SAMEORIGIN`.
- Asserted CSP presence with the default-src directive.
- Asserted `Referrer-Policy: no-referrer`.
- Asserted `Cross-Origin-Resource-Policy: cross-origin`.
- Asserted `X-Powered-By` is absent.

## Verification

- `npm ci` completed on the repository's Node 22+ toolchain.
- `npm test` passed: 2 files, 7 tests.
- `npm run lint` passed.
- `npm run build` passed.
- `git diff --check` passed.
- The test exercised the real Express app and observed the real Helmet response headers.

## Open risks and follow-up

- `npm ci` reported 9 existing dependency audit findings (2 low, 1 moderate, 6 high); dependency changes are outside issue #135.
- Maintainer review, merge, bounty approval, and payment remain external gates.
- The repository's Vercel deployment authorization is unrelated to this backend test change and must be handled by the repository team if required.

## Useful paths and commands

- Branch: `security-headers-tests-135`
- Test: `tests/health.test.ts`
- Summary: `SECURITY_HEADERS_135_SUMMARY.md`
- Verify: `npm run lint && npm run build && npm test`
