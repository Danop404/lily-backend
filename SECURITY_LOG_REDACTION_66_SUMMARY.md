# Request log redaction bounty #66

## Request

Implement the open `$80` security bounty for `Lilly-Protocol/lily-backend#66`, which asks for query-string and authorization metadata redaction in pino-http request logs.

## Changes

- Added `sanitizeRequestUrl()` to redact sensitive query keys such as `token`, `api_key`, `authorization`, `password`, `secret`, `signature`, and `wallet_seed`.
- Added a pino-http request serializer that keeps request ID, method, sanitized URL, and network address while omitting headers, query objects, params, raw request data, and bodies.
- Added regression tests for redaction, safe query preservation, and omission of sensitive metadata.

## Verification

- `npm test`: 3 files, 8 tests passed.
- `npm run lint`: passed.
- `npm run build`: passed.
- Existing integration logs show serialized requests contain no `headers` or raw query object.
- `npm ci` reports 9 existing dependency audit findings (2 low, 1 moderate, 6 high); dependency changes are outside this issue's scope.

## External status

- Issue #66 was claimed before editing and had no prior claim or PR at that time.
- Maintainer review, merge, bounty approval, and payment remain external gates.
- No payment details, tokens, credentials, or private maintainer data are included in the repository or public communication.

## Useful paths

- `src/common/http/request-logger.ts`
- `src/app.ts`
- `tests/request-logger.test.ts`
- `npm test`
- `npm run lint`
- `npm run build`
