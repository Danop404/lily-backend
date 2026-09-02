# 4xx error log level bounty #64

## Request

Implement the open `$65` bounty for `Lilly-Protocol/lily-backend#64` by logging handled 4xx responses at `warn` while retaining `error` for 5xx responses.

## Scope and decisions

- Kept the change limited to the existing error middleware and regression tests.
- Preserved response status codes, response bodies, redaction behavior, and logger context.
- Did not change dependencies or include credentials, payout details, or private maintainer information.

## Changes

- Updated `src/common/http/error.middleware.ts` to call `logger.warn` for statuses below 500 and `logger.error` for statuses 500 and above.
- Kept logger method calls bound to the Pino logger instance; this avoids changing existing 400/404 behavior.
- Added `tests/error-log-level.test.ts` covering 400, 404, 429, and 500 responses with spies on the real logger methods.

## Verification

- `npm ci` completed; it reported 9 existing dependency audit findings (2 low, 1 moderate, 6 high).
- Targeted test: 1 file, 4 tests passed.
- Full `npm test`: 3 files, 10 tests passed.
- `npm run lint`: passed.
- `npm run build`: passed.
- `git diff --check`: passed.

## External status

- Issue #64 had no existing claim or PR when work began.
- Maintainer review, merge, bounty approval, and payment remain external gates.
- No public payment identifier has been posted.

## Useful paths and commands

- Branch: `log-4xx-warn-64`
- Middleware: `src/common/http/error.middleware.ts`
- Test: `tests/error-log-level.test.ts`
- Verify: `npm test && npm run lint && npm run build && git diff --check`
