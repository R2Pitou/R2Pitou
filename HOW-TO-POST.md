# How To Post

To post, create one Markdown file in `_articles/` and commit it.

This site uses a Jekyll collection instead of `_posts/` because article filenames should be title-based, not date-prefixed.

## Filename Format

```text
_articles/Post-slug-title.md
```

## Example Filename

```text
_articles/GitHub-native-POSSE-setup.md
```

## Copy-Paste Post Template

```markdown
---
layout: post
title: "POST TITLE HERE"
date: 2026-05-12 09:00:00 +0700
categories: notes
featured: false
summary: "One or two sentence summary."
tags:
  - working-draft
syndicate: false
syndication:
  mastodon: false
  bluesky: false
  linkedin: false
  medium: false
  devto: false
---

Start writing here.
```

## What The Fields Do

- `categories` controls the URL shelf.
- The filename controls the post slug.
- `tags` are labels.
- `featured: true` puts the article in the featured area.
- `syndicate: true` allows future outward posting.

Use exactly one category. Suggested categories:

```text
architecture
systems
security
governance
writing
identity
notes
portfolio
```

## URL Formula

This file:

```text
_articles/GitHub-native-POSSE-setup.md
```

plus:

```yaml
categories: architecture
```

becomes:

```text
https://working-draft.org/architecture/github-native-posse-setup/
```

## Drafting

- Drafts can live in `_drafts/`.
- Drafts do not publish by default.
- To publish, move the draft into `_articles/` and make sure it has a `date`.

## Images

Use one flat image folder:

```text
assets/images/
```

Do not create per-article image folders.

Name article images with the article slug as the prefix:

```text
assets/images/article-slug-hero.webp
assets/images/article-slug-01.webp
assets/images/article-slug-02.webp
assets/images/article-slug-og.webp
```

Use these meanings:

- `article-slug-hero.webp` is the main hero image.
- `article-slug-01.webp`, `article-slug-02.webp`, etc. are inline images.
- `article-slug-og.webp` is an optional social preview image.

Reference images with root-relative paths:

```markdown
![Image description](/assets/images/article-slug-hero.webp)
```

## Checklist Before Committing

- File ends with `.md`.
- File is inside `_articles/`.
- Filename is title-based, for example `Title-of-the-article.md`.
- Front matter starts at line 1.
- Front matter begins and ends with `---`.
- `categories` has one value.
- `title` is quoted if it contains punctuation.
- `date` includes `+0700`.
- `summary` exists.
- Article images, if any, are in `assets/images/`.
- Article image filenames start with the article slug.
