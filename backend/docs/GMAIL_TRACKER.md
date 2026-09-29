# Gmail spreadsheet tracking service

Added 2026-09-29. Separate routes are mounted before the application's normal access logger and Helmet middleware. Existing marketplace routes fall through untouched. Each tracker response has no-store, no-referrer, restrictive CSP and cross-origin resource policy so remote email images can load.

## Routes

- POST /v1/register — Bearer access key, idempotent reference registration.
- POST /v1/events — Bearer access key; at most 200 tokens.
- GET /pixel/:token.gif — first image load; HEAD does not record an event.
- GET /confirm/:token — confirmation page, no confirmation side effect.
- POST /confirm/:token — first explicit confirmation action.
- GET /gmail-avisos/health — initializes the isolated table if necessary, cleans expired events and verifies database readiness.

The administrative key is generated randomly for the owner's installation. Only its SHA-256 digest is deployed in src/gmail-tracker-key-hash.json. The plain key is delivered locally, never in the repository, website or Web Store package. GMAIL_TRACKER_KEY_HASH may override the digest for rotation; update the owner's local configuration at the same time. This is a single-owner service, not a shared credential for public users. Public distribution requires separate accounts and per-user authorization before sharing hosted tracking access.

The service uses the existing Prisma/PostgreSQL connection, but an independent GmailTrackerEvent table. Table/index creation is idempotent on first use. Only random tokens, references and three timestamps are stored; no names, email addresses or content. Parameterized queries protect all external values. Registration is atomic with a unique reference. Events are excluded after 90 days and removed hourly while running and at health checks. Infrastructure and proxy logs can still include IPs and URLs. The application does not print keys, request URLs or event tokens for these routes.

The extension queries events while Chrome is open. No mail is sent by this server. Images are an opening indication only; confirmation is an unauthenticated action by a link holder. Reverse proxies/scanners may affect events.

Local test: node --test tests/gmail-tracker.test.cjs. Database integration is verified after deployment with a synthetic record; it does not send email. Rollback by removing the mount in src/app.js, leaving stored data intact. No changes to existing tables are required.
