# How To Post

To publish a new article, you will create a standard Jekyll page inside the `articles/` directory instead of using `_posts/` or a Jekyll collection.

## Directory and File Structure

Each article should have its own folder named after the article slug, nested inside its corresponding category folder. Inside this folder, create an `index.md` (or `index.html` if you need custom HTML formatting/styles):

```text
articles/<category>/<article-slug>/index.md
```

### Example Structure

For a new article titled "Cambodia's Digital Future" under the category "governance", the path is:

```text
articles/governance/cambodias-digital-future-needs-more-than-new-apps/index.md
```

## Front Matter Template

Every article requires front matter metadata at the very beginning of the file. Copy and paste this template:

```yaml
---
layout: article
title: "Your Article Title"
date: 2026-06-02 09:00:00 +0700
categories: governance
permalink: /governance/cambodias-digital-future-needs-more-than-new-apps/
canonical_url: https://working-draft.org/governance/cambodias-digital-future-needs-more-than-new-apps/
featured: false
summary: "One or two sentence summary of the article."
tags:
  - governance
  - digital-maturity
image: /assets/images/cambodias-digital-future-needs-more-than-new-apps-hero.png
image_alt: "Alternative text description of the hero image for screen readers."
---
```

## Field Explanations

- **`categories`**: Controls the URL shelf. Use exactly one lowercase category. Suggested categories:
  - `architecture`
  - `systems`
  - `security`
  - `governance`
  - `writing`
  - `identity`
  - `notes`
  - `portfolio`
  - `technology`
- **`permalink`**: Must be lowercase, matched to `/<category>/<article-slug>/`, and end with a trailing slash.
- **`canonical_url`**: 
  - For original posts: Must match the full `https://working-draft.org` permalink.
  - For copies of external publications (e.g. Phnom Penh Post): Point to the original article's URL to preserve SEO attribution.
- **`featured: true`**: Pins the article to the featured grid on the homepage (up to 3 featured articles).
- **`image`**: Root-relative path to the hero image (usually in `/assets/images/...`).

## Image Guidelines

All article images must be flat and stored under one of two conventions:

### Option A: Flat Assets Directory (Preferred)
Store images under:
```text
assets/images/
```
Keep the folder flat (do not create subfolders). Name the images using the article slug as a prefix, all lowercase kebab-case:
```text
assets/images/cambodias-digital-future-needs-more-than-new-apps-hero.png
assets/images/cambodias-digital-future-needs-more-than-new-apps-01.png
```

### Option B: Local Article Folder
Store images directly in the article's own folder (e.g. alongside `index.md`):
```text
articles/security/salary-day-trojan/virustotal.png
```
You can reference local images using:
```yaml
image: /articles/security/salary-day-trojan/virustotal.png
```

## Checklist Before Committing

1. **File Path**: The file is at `articles/<category>/<slug>/index.md` (or `index.html`).
2. **Metadata**: Front matter starts on line 1, begins and ends with `---`, and variables are filled.
3. **No Duplicate H1**: Do not start the markdown body with a `# Title` heading. The layout automatically renders the `title` front matter field as the page's single `<h1>`.
4. **URL Consistency**: `permalink` and `canonical_url` match the category and slug and are completely lowercase.
5. **No Spaces/Special Characters**: Ensure slug names and image file names contain only lowercase letters, numbers, and hyphens (no spaces, parentheses, or capitals).
