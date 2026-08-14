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

## Production release — 2026-08-12

Commit `34ff718` (`feat: publica newsletter semanal e resiliencia do chat`) is deployed on `main`. Amplify job #8 for commit `34ff718769127071fb3a22119a3c9f0018196596` finished with `SUCCEED` at 2026-08-12 16:37:33 -03. The production blog, weekly-content endpoint, newsletter UI, and chat were smoke-tested after deployment.

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

All three subscriptions are confirmed as of 2026-08-14. Verified through `cloudformation describe-stack-resources`: each `AWS::SNS::Subscription` carries a real subscription ARN as its `PhysicalResourceId`, which CloudFormation only writes after the recipient confirms. A pending subscription would read `PendingConfirmation` there instead. That check is the way to audit confirmation status without `sns:ListSubscriptionsByTopic`, which the `KiroBaxijenOperator` permission set does not grant.

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
contact and newsletter routes, admin Basic auth, and the weekly digest window.

Note for future work: `next/font` will fail the build if `Newsreader` is given
fixed `weight` values together with `style: ['normal', 'italic']`. Google Fonts
returns `.woff2` URLs for that combination that answer 404. The font is
variable, so `app/layout.tsx` requests the whole axis range instead.

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
