# CLAUDE.md — BaXiJen Site

`AGENTS.md` is the canonical project documentation: stack, chat/AI, DynamoDB data
layer, lead notifications, newsletter, and safety rules. Read it before changing
anything. This file only carries what you need before the first command runs.

## AWS CLI access

The AWS CLI is at `~/.local/bin/aws`. There is no `default` profile — every call
needs `--profile baxijen`, or `export AWS_PROFILE=baxijen` once per shell.

Profile `baxijen` maps to account `381492202560`, permission set
`KiroBaxijenOperator`, region `sa-east-1`.

This host is normally driven over SSH, so renew the session with the device-code
grant. It is the only variant that works remotely:

```bash
aws sso login --profile baxijen --use-device-code --no-browser
```

Open the printed URL in the browser on the local machine, confirm the code, and
approve. The default authorization-code flow fails over SSH because it waits on a
`127.0.0.1:<random>` callback that the local browser resolves against the wrong
machine; `--no-browser` on its own does not fix that.

Check the session with `aws sts get-caller-identity --profile baxijen` — not by
looking for new files in `~/.aws/sso/cache/`, which also appear when a login
fails. See "AWS CLI access (SSO)" in `AGENTS.md` for the full reasoning, the
token-cache layout, and how to clear stuck login processes.

## Tests

`npm test` watches, `npm run test:run` does a single pass. The suite is in
`tests/`, runs on Vitest in the `node` environment, and mocks the AWS SDK — it
never touches production tables. `amplify.yml` runs it before `npm run build`,
so a failing test blocks the deploy. Add tests alongside any change to lead
capture, validation, or the rate limiter.

## Ground rules

- Never commit `.env` or echo Amplify environment variables; `GetApp`/`ListApps`
  responses can contain secrets.
- Infrastructure changes go through CloudFormation (`infra/dynamodb.yml`), not
  ad-hoc console or CLI mutations.
- Use `example.invalid` addresses for tests against production tables and delete
  the records afterwards.
- Never return a success response for a write that failed — see the contact form
  section in `AGENTS.md` for why this rule exists.
- Lead `status` is human state set in the admin panel. Automated capture may
  update `score`, never `status`.
