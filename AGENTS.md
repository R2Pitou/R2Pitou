# AGENTS.md

## Project identity

This repository is the apex GitHub Pages site for `working-draft.org`.

It is the public root site for the project.

This repo is not the CV repo.
This repo is not the old `working-draft.org` repo.
This repo is not a Directus repo.
This repo is not infrastructure backup.
This repo is not a sandbox for architecture experiments.

The purpose of this repo is to serve the public website at:

- `https://working-draft.org/`

The `/cv` route is handled elsewhere and must be treated as an external stable route unless explicitly instructed otherwise.

---

## Hard boundaries

### 1. Do not touch README.md

`README.md` is intentionally maintained by the user and is off-limits.

Do not edit it.
Do not rename it.
Do not replace it.
Do not "improve" it.
Do not reformat it.
Do not delete it.
Do not derive site structure from it unless explicitly told to.

If a task seems to require touching `README.md`, stop and ask.

### 2. Do not assume repo topology

Do not assume this repo owns:
- `/cv`
- other subpaths
- old project content
- Directus-era content
- other repositories under the same GitHub account

Do not infer deployment ownership from repo names.

### 3. Do not introduce side quests

Do not add:
- Directus
- Tailscale
- Postgres
- Cloudflare Pages
- home server logic
- CI/CD redesign
- authentication
- dashboards
- admin panels
- databases
- forms
- analytics
- secret management systems
- unrelated automation

This repo is a static public site unless explicitly expanded.

### 4. Do not touch branding without approval

Do not change:
- colors
- typography choices
- layout direction
- tone of existing approved copy

Written content changes are allowed when requested.
Visual redesign is not allowed unless explicitly requested.

---

## What this repo is for

This repo is for the apex site content only.

Expected content types include:
- landing page
- consulting/service pages
- incident proof pages
- ISO 27001-aligned pages
- links to external or sibling routes like `/cv`
- downloadable/public artifacts only if explicitly placed here

Keep the site simple, static, and easy to publish.

---

## Working rules for agents

### Before making changes

Always identify:
1. the exact user request
2. the exact files that need to change
3. the files that must not change
4. whether the request is content, structure, or deployment related

If the task is unclear, prefer a topology/content report before editing.

### Allowed behavior

You may:
- create new HTML, Markdown, CSS, JS, or config files needed for the apex site
- update existing site pages that are clearly part of this repo's public site
- add GitHub Pages workflow files if required for this repo's actual publishing path
- add minimal navigation and linking between pages
- improve clarity, structure, grammar, and readability of requested content

### Forbidden behavior

You must not:
- edit `README.md`
- touch `/cv` unless explicitly asked and operating in the correct repo
- create or bind custom domains
- move apex ownership
- enable Pages on other repos
- add `CNAME` files unless explicitly instructed
- edit unrelated repos
- perform speculative cleanup outside the requested scope
- refactor broadly "while here"
- create side branches unless explicitly asked
- commit or push unless explicitly asked

---

## Deployment assumptions

This repo is intended to publish the apex site for `working-draft.org`.

Agents must verify the actual Pages publishing path before making deployment assumptions.

If GitHub Pages is configured for workflow-based publishing:
- only edit or create the minimum required workflow files
- do not redesign deployment architecture

If deployment is broken:
- diagnose first
- identify the actual publishing branch and mechanism
- make the smallest possible fix

---

## File discipline

Use minimal edits.
Touch only files required for the task.

When proposing changes, explicitly list:
- files to create
- files to edit
- files to leave untouched

Never silently modify unrelated files.

---

## Content guidance

Tone should be:
- direct
- credible
- specific
- readable by both technical and leadership audiences
- free of startup fluff
- free of fake-corporate padding

Prefer:
- concrete claims
- operational clarity
- grounded descriptions of real work
- simple page structure

Avoid:
- inflated marketing language
- vague claims of innovation
- generic consulting buzzwords
- rewriting everything for no reason

---

## Safe workflow for agents

Use this order:

1. Inspect relevant files
2. Report intended file changes
3. Make only approved or clearly requested changes
4. Summarize exactly what changed
5. Verify links/routes if relevant

For risky tasks, use:
- facts observed
- assumptions
- unknowns
- proposed minimal action

Do not skip straight to implementation when topology is uncertain.

---

## Current known repo-role facts

- This repo is the apex site repo.
- `/cv` should be treated as an external stable route unless explicitly instructed otherwise.
- `README.md` is precious and must not be touched.
- The user strongly prefers complete-file rewrites over patch fragments when requesting code rewrites.
- CSS and color changes require explicit approval.
- Written content changes are acceptable when requested.

---

## If unsure

Stop.
Do not improvise.
Do not "helpfully" expand scope.

Ask for clarification or produce a report instead of making risky changes.