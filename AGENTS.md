# AGENTS.md — BaXiJen Site

## Project

- Repository: `BaxiJen/nextech` (local path: `/home/marcus/personal/nextechia`).
- Production: `https://www.baxijen.com.br`.
- Hosting: AWS Amplify Hosting, app `baxijen-site`, app ID `d3e9h6jnm553nw`, region `us-east-1`, production branch `main`.
- AWS account: `381492202560` (`Baxijen`). Application infrastructure and Bedrock are in `sa-east-1`; Amplify remains in `us-east-1`.
- Restricted local AWS profile: `baxijen` (IAM Identity Center permission set `KiroBaxijenOperator`). Renew with `~/.local/bin/aws sso login --profile baxijen`.
- Never commit `.env` or print Amplify environment variables; Amplify `GetApp`/`ListApps` responses can include secret values.

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

Marcus confirmed the controlled SNS subscription and receipt. Synthetic lead `notification-test-20260812t163230@example.invalid` produced Lambda log lead ID `notification-test-20260812t163230` and SNS message ID `d68a1a61-652c-5cbd-8ba3-7897a9b1bdcc`; it was conditionally deleted and a consistent final read returned no item. Leo and contato remain versioned for later confirmation and must not be removed unless project direction changes.

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

## Safety / workflow

- Prefer CloudFormation over ad-hoc infrastructure changes.
- DynamoDB tables have `DeletionPolicy: Retain`; deleting the stack does not delete table data.
- Use synthetic `example.invalid` addresses for tests and remove test records afterward.
- Never include full chat transcripts in notification emails.
- Weekly digest must send at most once per campaign and must send nothing when there are no new posts.
- Keep DynamoDB, SES, Lambda, SNS, and Bedrock in `sa-east-1`; keep Amplify in `us-east-1`.
- Do not alter the existing DMARC quarantine policy or proxy DKIM records through Cloudflare.
