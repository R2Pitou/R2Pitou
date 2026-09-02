# Fediverse discovery and scream room

This Worker is intentionally limited to the three discovery endpoints required
for the split-domain identity `@arttu@working-draft.org` plus the public
`POST /api/scream` gateway:

- `/.well-known/webfinger`
- `/.well-known/host-meta`
- `/.well-known/nodeinfo`
- `/api/scream`

Discovery requests redirect to `social.working-draft.org`, preserving query
strings and adding a permissive CORS header. `/api/scream` accepts exactly
`{"text": "..."}` and runs the deterministic Python policy in
`src/scream_policy.py` before sending an accepted vent to Slack. Profanity,
sexuality, insults, politics, and general provocation are allowed. Obvious
credentials, tokens, session cookies, direct identifiers, IP addresses,
payment cards, government-ID-like values, and street-address structures are
rejected. Slack mass mentions are neutralized. No request text is logged.
Every HTTP(S), `www.`, or recognizable bare-domain URL is replaced with
`[URL removed]` before forwarding, so Slack recipients receive no browseable
external target from a vent.
Slack-rendered control markup, custom and Unicode emoji, `#`, and query-string
fragments are neutralized before forwarding as well.

The endpoint has an edge-local rate limit of eight requests per minute per
Cloudflare client IP. It is a protective control, not an exact global quota.

Before deploying, add `SLACK_SCREAM_WEBHOOK` as an encrypted Worker secret. Do
not put the webhook URL in `wrangler.toml`, source, or a committed `.dev.vars`
file.

Run the deterministic policy tests with:

```powershell
python -m unittest discover -s tests -v
```

This Worker uses only the Python standard library and Cloudflare's built-in
Python runtime SDK. `wrangler deploy --dry-run` validates the bundle without
adding a Python package-management toolchain to this repository. Do not deploy
until the required secret is configured.
