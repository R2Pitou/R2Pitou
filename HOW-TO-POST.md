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
permalink: /notes/post-title-here/
canonical_url: https://working-draft.org/notes/post-title-here/
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
- `permalink` must be lowercase and should match the category plus filename slug.
- `canonical_url` must be the full `https://working-draft.org/.../` version of `permalink`.
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

Use lowercase URLs. Filenames may use title case for readability, but canonical article URLs should be lowercase.

Automatic GitHub checks fail if an article permalink is missing, mixed-case, or does not match:

```text
/<category>/<lowercase-filename-slug>/
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

Keep image filenames URL-safe:

- lowercase letters
- numbers
- hyphens
- normal file extensions such as `.webp`, `.jpg`, `.png`

Do not use spaces, parentheses, punctuation, or mixed case in article or image filenames.

Parentheses such as `(3)` can exist in URLs technically, but do not use them here. They are easy to encode incorrectly and make links uglier.

Before committing, you can auto-normalize article and image filenames:

```powershell
python scripts\normalize_articles.py
```

The same script runs in GitHub Actions check mode and fails the build if filenames or canonical URLs need normalization.

## Checklist Before Committing

- File ends with `.md`.
- File is inside `_articles/`.
- Filename is title-based, for example `Title-of-the-article.md`.
- Front matter starts at line 1.
- Front matter begins and ends with `---`.
- `categories` has one value.
- `permalink` is lowercase.
- `canonical_url` starts with `https://working-draft.org`.
- `title` is quoted if it contains punctuation.
- `date` includes `+0700`.
- `summary` exists.
- Article images, if any, are in `assets/images/`.
- Article image filenames start with the article slug.
- Article and image filenames are lowercase kebab-case.
