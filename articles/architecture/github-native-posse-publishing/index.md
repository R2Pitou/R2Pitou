---
layout: article
title: GitHub-native POSSE publishing
date: 2026-05-12 04:00:00 +0700
featured: false
summary: A short note on making working-draft.org the canonical source for articles, with syndication treated as an outward layer.
tags:
  - github
  - jekyll
  - posse
  - publishing
image: hero.png
image_alt: It's a bloody image.
categories: architecture
permalink: /architecture/github-native-posse-publishing/
canonical_url: https://working-draft.org/architecture/github-native-posse-publishing/
---

Working Draft is set up as a GitHub-native POSSE site: publish on the owned domain first, then syndicate outward.

The durable source is a Markdown file in the repository. GitHub Pages builds the site with Jekyll, and the canonical URL stays on `working-draft.org`.

Syndication can come later. The important part is that external platforms point back here instead of becoming the source of record.
