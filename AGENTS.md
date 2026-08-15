# AGENTS.md — BaXiJen Site

## Project

- Repository: `BaxiJen/nextech` (local path: `/home/marcus/personal/nextechia`).
- Production: `https://www.baxijen.com.br`.
- Hosting: AWS Amplify Hosting, app `baxijen-site`, app ID `d3e9h6jnm553nw`, region `us-east-1`, production branch `main`.
- AWS account: `381492202560` (`Baxijen`). Application infrastructure and Bedrock are in `sa-east-1`; Amplify remains in `us-east-1`.
- Restricted local AWS profile: `baxijen` (IAM Identity Center permission set `KiroBaxijenOperator`). See [AWS CLI access](#aws-cli-access-sso) for how to renew the session from this host.
- Never commit `.env` or print Amplify environment variables; Amplify `GetApp`/`ListApps` responses can include secret values.

## AWS CLI access (SSO)

- Profile `baxijen` -> account `381492202560`, permission set `KiroBaxijenOperator`, default region `sa-east-1`.
- SSO session `baxijen`: start URL `https://d-9a67704b39.awsapps.com/start`, SSO region `us-east-2`. The session region differs from the resource region on purpose.
- There is no `default` profile. Every command needs `--profile baxijen`, or `export AWS_PROFILE=baxijen` once per shell.

### Logging in over SSH

This host is normally reached over SSH (Termius), so the default login flow does not work. Use the device-code grant:

```bash
aws sso login --profile baxijen --use-device-code --no-browser
```

Open the printed URL in the browser on the *local* machine, confirm the code matches the terminal, and approve. The CLI polls AWS and finishes on its own.

Why the other variants fail:

- Bare `aws sso login` reads the non-existent `default` profile and fails with `Missing the following required SSO configuration values: sso_start_url, sso_region`.
- The default authorization-code grant opens a listener on `127.0.0.1:<random>` on this host and points the browser at that address. Over SSH the browser resolves `127.0.0.1` against the local machine, the callback never reaches the CLI, and the code expires unused.
- `--no-browser` alone only disables auto-opening the URL; it keeps the localhost callback, so it does not fix the SSH case. It is useful only combined with `--use-device-code`.

### Verifying the session

```bash
aws sts get-caller-identity --profile baxijen
```

The token cache is `~/.aws/sso/cache/1f09405a494ccea2144b4dbd93d150869834703c.json` (SHA-1 of the session name `baxijen`). A live session means that file holds an `accessToken` whose `expiresAt` is in the future.

Do not read a successful login from the cache directory alone: files holding only `clientId`, `clientSecret`, and `expiresAt` are OIDC client registrations, which are written even when the login never completes and expire ~90 days out. `kiro-auth-token.json` belongs to Kiro and is unrelated to this profile.

Abandoned attempts stay alive as `aws sso login` processes holding stale registrations. Clear them with `pkill -f "aws sso login"` before retrying.

## Production release — 2026-08-14

Commit `1b06f65` (`fix: rota de contato própria, fim do rebaixamento de lead e suíte de testes`) is deployed on `main`. Amplify job #11 finished with `SUCCEED` at 2026-08-14 20:19 -03. It is the first release gated by `npm run test:run`.

Verified against production after the deploy:

- `/sbpc-cadastro` and `/api/cadastro-sbpc` answer 404; they answered 200 before.
- `/contato` answers 200; `/api/contato` rejects an unknown `assunto` and an invalid email with 400.
- A submission with `teste-contato-20260814t232105@example.invalid` persisted with the phone normalised to `+5521999998888`, `objective` holding the readable subject label, and `notes` in plain text rather than a JSON blob.
- The stream fired: `lead-notifier` logged `Lead notification published` with lead ID `ea48deb2-9f1f-4c9e-bad0-f08ad7a2028f` and SNS message ID `11a5e836-bc06-580b-947c-8acf1925aac7`.
- Demotion regression, exercised end to end: the record was set to `score 75` / `qualified` to stand in for a chat-qualified lead, then the form was submitted again with the same address. `score` stayed 75, `status` stayed `qualified`, and `objective` kept the chat's value. Only `notes` advanced to the newer message. The old code would have written `score 0` / `new`.
- Both submissions survived as `form_submit` rows in `baxijen-prod-interactions`, confirming that `notes` holding only the latest message does not lose history.
- The synthetic lead and its two interactions were deleted; a consistent read returned no item and `baxijen-prod-interactions` scanned back to 0.

### Previous release — 2026-08-12

Commit `34ff718` (`feat: publica newsletter semanal e resiliencia do chat`), Amplify job #8, `SUCCEED` at 2026-08-12 16:37:33 -03. The production blog, weekly-content endpoint, newsletter UI, and chat were smoke-tested after deployment.

Validation completed before release:

- Targeted ESLint passed.
- Full `tsc --noEmit` passed.
- Full production build passed.
- CloudFormation assertions and real `validate-template` passed.
- Both inline Lambda programs passed `node --check`.
- Release diff/secret-marker checks passed.

## Chat / AI

- Route: `app/api/chat/route.ts`.
- Model: `zai.glm-5` through Amazon Bedrock Mantle in `sa-east-1`.
- Mantle endpoint: `https://bedrock-mantle.sa-east-1.api.aws/v1`.
- Prompt: `lib/ai/agentPrompt.ts`; shared greeting: `lib/ai/greeting.ts`.
- The guided funnel collects objective, name, diagnostic context, phone, email, and organization, then calls `capture_lead`.

The intermittent fallback after the visitor entered `250` was diagnosed in CloudWatch stream `main/2026/08/12/1119ce1e4d7448fab307efcd681016b2`. Session `session_1786552946133_tnu1i4tjf` had four successful GLM 5 turns taking 6.983–22.526 seconds; request `02888600-30d1-47b2-9e5b-2aa910295e72` was terminated by Amplify at 28,003.45 ms. Old Supabase DNS errors in that stream were unrelated admin traffic.

Production correction:

- `lib/ai/bedrock.ts`: 23-second request timeout and `maxRetries: 0` keep an attempt below Amplify's SSR ceiling.
- `app/api/chat/route.ts`: transient Bedrock failures return safe retryable HTTP 503 JSON; tool-call follow-up uses the remaining route budget; `retryAttempt=1` prevents duplicate user-message persistence.
- `components/LiveAgent.tsx`: at most one retry in a separate SSR request, followed by safe visitor-facing text.

The previously failing education conversation ending in `250` was replayed in production. Attempt 0 returned HTTP 200 in 2.467 seconds with a normal GLM 5 response and no technical fallback. Synthetic session `timeout-fix-test-20260812t1638` was deleted afterward, including both chat-history rows.

## DynamoDB production data layer

CloudFormation stack `baxijen-prod-data` in `sa-east-1` is `UPDATE_COMPLETE`. Template: `infra/dynamodb.yml`; setup guide: `docs/dynamodb-setup.md`.

Tables use `PAY_PER_REQUEST`, SSE/KMS, PITR, and deletion protection:

- `baxijen-prod-leads`: PK `email`; GSIs `id-index`, `created-at-index`; active `NEW_IMAGE` stream.
- `baxijen-prod-chat-history`: PK `session_id`, SK `message_key`; GSI `lead-id-index`; TTL `expires_at`.
- `baxijen-prod-interactions`: PK `lead_id`, SK `interaction_key`.
- `baxijen-prod-newsletter`: PK `email`; active GSIs `confirm-token-index` and `unsub-token-index`.

Amplify SSR compute role `baxijen-prod-amplify-ssr-dynamodb` supplies temporary credentials; the application uses no static AWS access keys. Data access lives in `lib/dynamodbService.ts`, with client/config in `lib/dynamodb/client.ts`.

The first infrastructure update rolled back safely because Lambda `ReservedConcurrentExecutions` would have reduced unreserved account concurrency below AWS's minimum of 10. Reserved concurrency was removed from both Lambdas, the template was revalidated, and the retry reached `UPDATE_COMPLETE`. No table was replaced and no data was lost.

## New-lead notifications

New leads flow through DynamoDB Streams → `baxijen-prod-lead-notifier` → SNS topic `baxijen-prod-new-leads`. The Node.js 22 ARM64 Lambda consumes only `INSERT` records, batch size 1, and sends structured lead fields rather than full chat transcripts.

CloudFormation retains email subscriptions for:

- `leo@baxi.ia.br`
- `marcus@baxi.ia.br`
- `contato@baxi.ia.br`

**Audit with `sns:ListSubscriptionsByTopic`, not with CloudFormation.** The
permission set grants that call since 2026-08-15.

The CloudFormation `PhysicalResourceId` of an `AWS::SNS::Subscription` holds a
real subscription ARN once the recipient confirms, and the literal string
`PendingConfirmation` before that. It answers "was this ever confirmed" and
nothing else. Every SNS notification email carries an unsubscribe link, and
clicking it deletes the subscription in SNS without touching the stack, which
goes on reporting a resource that no longer exists.

That is not hypothetical. On 2026-08-15 the stack listed three confirmed
subscriptions while SNS held two: `leo@baxi.ia.br` had been unsubscribed out of
band and was receiving nothing. The earlier note in this file claiming all three
were confirmed was written from the CloudFormation view and was wrong by the
time it was written.

Synthetic lead `notification-test-20260812t163230@example.invalid` produced Lambda log lead ID `notification-test-20260812t163230` and SNS message ID `d68a1a61-652c-5cbd-8ba3-7897a9b1bdcc`; it was conditionally deleted and a consistent final read returned no item. That invocation on 2026-08-12 19:32:46Z is still the only entry in `/aws/lambda/baxijen-prod-lead-notifier` — the pipeline has never fired for a real lead.

## Newsletter

The public newsletter is a double-opt-in weekly digest:

- `components/blog/NewsletterForm.tsx` presents accurate pending, confirmed, already-subscribed, and unsubscribed states with CTA `Quero receber`.
- `/blog#newsletter` places the form above the post grid; Header and Footer link to it.
- `components/blog/FloatingNewsletterCard.tsx` is mounted only on the home page. It uses a desktop card and mobile strip beside chat, and can be dismissed for seven days through `localStorage`.
- `app/api/newsletter/route.ts` validates/rate-limits signup, handles idempotent pending/confirmed records, confirms through canonical production redirects, and unsubscribes through per-subscriber tokens.
- Unsubscribe sets `confirmed=false`, records `unsubscribed_at`, and rotates `confirm_token`, preventing an old confirmation URL from re-enabling a subscription.
- `app/api/newsletter/weekly-content/route.ts` returns up to five posts from the last seven days, canonical URLs, no-store headers, and a stable SHA-256 campaign ID.

SES v2 is in `sa-east-1`, sender `BaXiJen Newsletter <newsletter@baxi.ia.br>`. Identity `baxi.ia.br` is verified for sending; Easy DKIM is `SUCCESS` with RSA 2048 and all three public CNAMEs resolve to matching `dkim.amazonses.com` targets. Cloudflare records remain `DNS only`. Existing DMARC remains `p=quarantine`; do not add SES's example `p=none` record.

SES production access is `GRANTED`: `ProductionAccessEnabled=true`, `SendingEnabled=true`, quota 50,000 messages/day and 14/second. Account-level suppression is enabled for bounce and complaint.

### Weekly sender

Lambda `baxijen-prod-newsletter-digest`:

- fetches the live weekly-content endpoint;
- sends nothing when there are no new posts;
- selects only confirmed, non-unsubscribed recipients;
- validates same-origin blog URLs;
- atomically claims a campaign before sending and records sent/failed state;
- throttles to one email/second;
- includes a unique unsubscribe URL;
- limits EventBridge delivery to two retries and one-hour event age.

Controlled production validation completed with `marcus@baxi.ia.br`:

1. Signup returned HTTP 200 with `confirmation_required=true`; canonical confirmation redirected to `https://www.baxijen.com.br/blog?confirmed=true#newsletter` and persisted `confirmed=true`.
2. Manual campaign `weekly-10a38977e59cc4a1d902b3ef` completed with one post, one subscriber, `sent=1`, `failed=0`; Marcus confirmed receipt.
3. A second invocation of the same campaign returned `sent=0`, `skipped=1`, proving at-most-once weekly delivery.
4. Unsubscribe redirected to `https://www.baxijen.com.br/blog?unsubscribed=true#newsletter`, persisted `confirmed=false` plus `unsubscribed_at`, and invalidated the old confirmation token. The old confirmation URL redirected with `confirmed=error`.
5. The controlled subscriber was conditionally deleted; a consistent final read returned no item.

After those checks, reviewed change set `enable-newsletter-digest-20260812t2026` was executed. Stack `baxijen-prod-data` returned `UPDATE_COMPLETE`; parameter/output `NewsletterDigestScheduleState=ENABLED`. EventBridge rule `baxijen-prod-newsletter-weekly` is directly verified `ENABLED` with `cron(0 13 ? * FRI *)` (Friday 13:00 UTC). The schedule must remain CloudFormation-managed.

## Contact form

`/contato` posts to `/api/contato`. That route validates the payload, rate-limits
per client IP (5 requests / 15 min), upserts the lead into `baxijen-prod-leads`
and records the submission as a `form_submit` interaction.

It replaced `/api/leads/fake-door`, which was the endpoint of a finished A/B test.
The contact form had been reusing it under `test_id: 'D'`, which forced it to
carry fields no longer collected and a Google Sheets fallback whose environment
variable never reached the SSR runtime. Both are gone, along with the SBPC event
landing page, its route, and the three Apps Script files under `scripts/`.

Two invariants the route exists to protect:

- **A failed write is never reported as success.** If `upsertLead` returns null
  the route answers 502 and the form renders the message. The removed SBPC route
  did the opposite — it answered `success: true` while dropping the record.
- **A form submission never demotes a lead.** `score`, `status` and `objective`
  go through `upsertLead`'s `initialOnly` argument, which writes with
  `if_not_exists`. Someone who reached `qualified` through the chat and later
  fills the form stays `qualified`.

The chat route follows the same rule: it recalculates `score` on every capture
because that is a computed signal, but `status` is initial-only and the upgrade
to `qualified` goes through `promoteLeadToQualified`, whose
`ConditionExpression` only fires while the lead is still `new`. That is what
keeps a `converted` lead from silently reverting when the visitor chats again.

## Tests

Vitest, `npm test` to watch and `npm run test:run` for a single pass. The suite
lives in `tests/` and runs in the `node` environment — no DOM, no network, and
the AWS SDK is always mocked. `amplify.yml` runs `npm run test:run` before
`npm run build`, so a red suite fails the deploy.

Covered: lead field validation and phone normalization, chat history
sanitization, retryable-error classification, the sliding-window rate limiter,
`upsertLead` expression building (including the `initialOnly` regression),
`promoteLeadToQualified` conditional semantics, `calculateLeadScore`, the
contact and newsletter routes, the weekly digest window, and the whole panel
access path: allowlist, code issue and consumption, session lifecycle, the
proxy gate and the audit trail on lead mutations.

Note for future work: `next/font` will fail the build if `Newsreader` is given
fixed `weight` values together with `style: ['normal', 'italic']`. Google Fonts
returns `.woff2` URLs for that combination that answer 404. The font is
variable, so `app/layout.tsx` requests the whole axis range instead.

## Contact-form notification

`/api/contato` publishes to `baxijen-prod-new-leads` itself, through
`lib/notifications/newLead.ts`. `LeadNotificationFunction` skips records whose
`source` is `form` so the same submission is not announced twice; it still
handles chat captures, without transcripts.

The stream-driven Lambda could not do this job. It only sees `INSERT`, so a
person already in the table who fills the form again produced no notice at all,
and the stream image has no request context — the visitor's own message lives in
`notes`, which the Lambda deliberately does not send. Publishing from the route
solves both: it holds the message, and it knows whether the lead already existed
by comparing `created_at` with `updated_at`, which `upsertLead` only makes equal
at creation.

The alternative was `StreamViewType: NEW_AND_OLD_IMAGES`, so the Lambda could
diff a form resubmission against a panel status change. That replaces the
stream, changes its ARN and forces the event source mapping to be repointed,
with a window of dropped events. Rejected for that reason.

Two details that are easy to get wrong:

- The module reads the environment on every call rather than at module scope.
  In the SSR runtime the import can happen before `.env.production` applies, and
  a top-level constant would freeze the missing value for the life of the
  container.
- The SNS `Subject` is reduced to ASCII. SNS rejects the whole `Publish` call if
  it carries an accent, so a lead named "João" would have failed to notify. The
  full name still goes in the body.

Verified in production on 2026-08-15 after stack update `contato-sns-v2-235453`:
a first submission logged `returning: false` with SNS message
`5b440419-90ea-5c86-a673-66e03d882b47`, a second from the same address logged
`returning: true` with `251e7296-5ff6-583b-b298-106ff2941ffa`, and
`lead-notifier` was invoked by the stream without publishing anything.

## Panel access — code by email, sessions, audit trail

Built 2026-08-15, replacing the single shared `ADMIN_USERNAME`/`ADMIN_PASSWORD`
Basic auth. Four people have access: `leo@`, `marcus@`, `luiz@` and
`lala@baxi.ia.br`.

The allowlist lives in `lib/auth/allowlist.ts`, not in an environment variable,
so adding or removing someone goes through commit and review. Removing an email
also revokes live sessions: `readSession` re-checks the list on every read.

**Code of six digits, not a magic link.** The email opens on the phone while the
panel is on the desktop, and corporate scanners (Safe Links, antivirus) prefetch
links and burn single-use tokens before the person clicks. Neither failure mode
exists with a typed code.

**Three tables**, all in `infra/dynamodb.yml`:

| Table | Key | TTL | Holds |
|---|---|---|---|
| `admin-auth-codes` | `email` | `expires_at` | HMAC of the code, `attempts`, `issued_at` |
| `admin-sessions` | `token_hash` | `expires_at` | email, name, `last_seen_at`, user agent |
| `admin-audit-log` | `entity` + `occurred_at` | none | actor, action, before, after |

Neither table ever holds the secret itself — the code and the session token are
stored as HMAC-SHA256 under `ADMIN_AUTH_SECRET`. A read of either table is not
enough to get in. The audit table has no `DeleteItem` or `UpdateItem` in the
compute role's policy: whoever can edit their own audit trail has none.

Four decisions worth keeping:

- **Verification and consumption are the same conditional write.** `consumeCode`
  issues a `DeleteItem` conditioned on hash, expiry and attempt count. Reading
  first and deleting after would leave a window where the same code works twice.
- **`expires_at` is compared in code, not delegated to the TTL.** DynamoDB only
  promises to delete within 48 hours; using it as the clock would keep dead
  codes and sessions alive for days.
- **The session is a row, not a JWT.** Deleting the row cuts access
  immediately; a JWT only stops working when it expires. That costs one
  `GetItem` per admin request, which at four users is nothing.
- **The response to an unknown email is identical** to the response to a member,
  and nothing is written or sent. Any difference — body, status or a much
  faster reply — turns the login form into an oracle for who has access. The
  non-member path sleeps 250 ms to narrow, not erase, the timing gap.

`proxy.ts` gates `/admin/:path*` and `/api/admin/:path*`, letting only
`/admin/login` through. It still fails closed: no secret, or a DynamoDB error
while reading the session, answers 503 rather than falling open. Every admin
route also calls `requireSession` on its own, so a future route created outside
the matcher does not become public by accident.

Mutations record who did what. A lead moving from `new` to `qualified` writes
actor, both values and the timestamp; the panel shows it in the lead modal and
in "atividade recente". If the audit write fails, the mutation is **not** rolled
back and the response stays 200 — the change did happen, and the details go to
CloudWatch under `[audit]` so the row can be reconstructed. Reporting failure
for a write that succeeded is the same lie as the reverse, which is why it is
worth stating.

### Environment variables

| Variable | Required | Default |
|---|---|---|
| `ADMIN_AUTH_SECRET` | yes, ≥ 32 chars | none — panel answers 503 without it |
| `ADMIN_FROM_EMAIL` | no | `BaXiJen <contato@baxi.ia.br>` |
| `ADMIN_SESSION_DAYS` | no | `7` |

`ADMIN_USERNAME` and `ADMIN_PASSWORD` are no longer read by anything and should
be deleted from Amplify after the deploy.

### Deploy order

The stack must go first, and the secret before the code:

1. Execute the changeset that creates the three tables and widens the compute
   role. Nothing in production reads them yet.
2. Set `ADMIN_AUTH_SECRET` in Amplify **and make sure `amplify.yml` greps it
   into `.env.production`**. A console variable alone never reaches the SSR
   runtime — that build step is the only bridge, and forgetting it ships a
   panel that answers 503 with a correctly configured console.
3. Push. If either step above is missing the panel answers 503 and the public
   site is untouched — the failure mode is a locked door, not an open one.

## Chat funnel instrumentation

Built 2026-08-15. Answers the question that took a message-by-message read to
answer before: where the conversation stops.

`baxijen-prod-funnel-events` holds one row per `(session_id, step)`, written
with `attribute_not_exists(session_id)`. That condition is the whole design:
because a pair can only be inserted once, counting rows per step in the
`step-index` GSI *is* counting sessions, with no dedup pass and no risk of a
retry inflating a number. TTL matches `CHAT_RETENTION_DAYS` — the event is only
useful while the conversation it describes still exists.

Seven steps, in `lib/funnel/steps.ts`: `conversa_iniciada`, `objetivo_descrito`,
`diagnostico_respondido`, `dados_pedidos`, `telefone_informado`,
`email_informado`, `lead_capturado`.

**Derivation is deterministic and server-side.** `reachedSteps` looks at the
sanitized history plus the reply just generated — no extra model call, no
inference cost, nothing the visitor notices. Phone and email reuse
`normalizePhone` and `isValidEmail`, so "12.000 atendimentos" does not count as
a phone number; that false positive would inflate precisely the step worth
measuring.

**One step is a heuristic and it is worth knowing which.** `dados_pedidos`
matches the phrases `SALES_AGENT_PROMPT` tells the agent to use when it asks for
contact details. If that prompt changes vocabulary, the tests in
`tests/funnel/steps.test.ts` fail — which is the reason they pin the exact
sentences.

`recordFunnelProgress` never throws. Instrumentation that takes down the route
it observes is worse than no instrumentation, so a failure is logged under
`[funil]` and the conversation continues. It reads the session's existing steps
first and writes only the new ones; the conditional write still guards against
two concurrent turns of the same session.

`/api/admin/funil?dias=30` counts each step over a window and reports the
largest drop between consecutive steps. The bottleneck is labelled by the step
the conversations **failed to reach**, which is what the panel shows in red.

Note the counts start at deploy time. Conversations older than this release
have no events and will never appear in the funnel.

## Open items

Found during the 2026-08-14 audit and deliberately not fixed in that release.
Nothing here is in progress.

### Needs attention

- **`leo@baxi.ia.br` is unsubscribed from `baxijen-prod-new-leads`.** Found
  2026-08-15. The stack still declares the subscription, so a plain stack update
  will not recreate it — CloudFormation believes the resource exists. Restoring
  it means either renaming the logical ID to force a create, or subscribing out
  of band and accepting the drift. Left as is pending a decision: the
  unsubscribe may well have been deliberate, and re-subscribing someone who
  opted out is not a call to make on their behalf.

### Application, no infrastructure involved

- **No security headers.** `next.config.ts` has no `headers()` block: no CSP,
  HSTS, `X-Frame-Options` or `Referrer-Policy`. `dangerouslyAllowSVG` is on.
- **`@vercel/analytics` is dead weight.** `app/layout.tsx` mounts `<Analytics />`,
  which requests `/_vercel/insights/script.js` — a path that does not exist
  outside Vercel. It runs on every page and reports nowhere.
- **`images.unoptimized` is `true`,** which disables the Next image optimiser on
  a visually heavy site.
- **The rate limiter is per-instance.** `lib/ai/rateLimit.ts` keeps its window in
  process memory and its comment assumes a single container. The platform is
  `WEB_COMPUTE`, which is Lambda-backed, so the real ceiling is the configured
  limit per execution environment, not per site. A shared store would be needed
  for a global limit.
- **Dead secrets in the local `.env`.** `OPENAI_API_KEY`, `NEXT_PUBLIC_SUPABASE_*`
  and `SUPABASE_SERVICE_KEY` predate the DynamoDB migration. The file is
  correctly gitignored and untracked, but the keys should be rotated and removed.
- **18 pre-existing ESLint errors** in `components/three/Particles.tsx`,
  `app/sobre/SobreContent.tsx`, `app/sibem/SibemContent.tsx`,
  `components/CTAExplosion.tsx`, `components/TypeWriter.tsx` and `lib/types.ts`.
  None are in code touched by the 2026-08-14 release.
- **Campaigns do not exist as data.** There is no campaign entity and no record
  of a digest send outside the Lambda log, so the panel cannot show either. It
  is the last item of the four agreed on 2026-08-14.

### Product, not engineering

- **No funnel instrumentation.** On 2026-08-14 the two chat sessions on record
  had both stopped at the same step — after the visitor gave volume and context,
  before the agent asked for an email — which is why `capture_lead` never fired.
  Reading that required going through `baxijen-prod-chat-history` message by
  message. There is no per-step drop-off metric.
- **`baxijen-prod-leads` held no real lead** between the 2026-08-12 launch and
  the 2026-08-14 audit. The capture path is sound; the constraint is traffic and
  conversion.

### Housekeeping

- `teste@gmail.com` (lead `a7ed8e68-af8b-4cf2-9e4e-c11ca5f47be0`, created
  2026-08-14T22:40:17Z) is a manual test of the pre-release contact form. It did
  notify — SNS message ID `a655ec61-e83c-5126-9b17-8e9873af7eea`. Left in place
  pending a decision; it is the only row in the table.

## Safety / workflow

- Prefer CloudFormation over ad-hoc infrastructure changes.
- DynamoDB tables have `DeletionPolicy: Retain`; deleting the stack does not delete table data.
- Use synthetic `example.invalid` addresses for tests and remove test records afterward.
- Never include full chat transcripts in notification emails.
- Never answer a write failure with a success payload; the visitor must be able to tell that nothing was saved.
- Automated capture may update computed signals such as `score`, but must not overwrite `status` — that is human state, set in the panel.
- Weekly digest must send at most once per campaign and must send nothing when there are no new posts.
- Keep DynamoDB, SES, Lambda, SNS, and Bedrock in `sa-east-1`; keep Amplify in `us-east-1`.
- Do not alter the existing DMARC quarantine policy or proxy DKIM records through Cloudflare.
