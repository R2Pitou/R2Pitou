# Fediverse discovery redirect

This Worker is intentionally limited to the three discovery endpoints required
for the split-domain identity `@arttu@working-draft.org`:

- `/.well-known/webfinger`
- `/.well-known/host-meta`
- `/.well-known/nodeinfo`

It redirects those requests to `social.working-draft.org`, preserving query
strings and adding a permissive CORS header. No other Working-Draft.org request
is routed through this Worker.

Deploy from this directory with `wrangler deploy`.
