---
layout: article
title: "Tools for Use (Don't Lose)"
date: 2026-07-25 09:00:00 +0700
categories: technology
permalink: /technology/tools-for-use-dont-lose/
canonical_url: https://working-draft.org/technology/tools-for-use-dont-lose/
featured: false
summary: "Personal bookmark index of web utilities, media downloaders, AI sandboxes, and media resources automatically populated from _data/tools.csv."
image: /assets/images/tools-for-use-dont-lose-hero.png
image_alt: "A digital toolkit illustration."
tags:
  - tools
  - index
  - resources
---

Personal bookmark index of web utilities, media downloaders, creative archives, and AI sandboxes.

*To add or edit tools, simply edit [`_data/tools.csv`](https://github.com/R2Pitou/R2Pitou/edit/main/_data/tools.csv).*

---

{% assign categories = site.data.tools | map: "category" | uniq %}

{% for cat in categories %}
### {{ cat }}

<table class="tools-index-table">
  <thead>
    <tr>
      <th style="width: 25%;">Tool</th>
      <th style="width: 25%;">Link</th>
      <th style="width: 50%;">Description</th>
    </tr>
  </thead>
  <tbody>
    {% assign cat_tools = site.data.tools | where: "category", cat %}
    {% for tool in cat_tools %}
    <tr>
      <td><strong>{{ tool.title }}</strong></td>
      <td><a href="{{ tool.url }}" target="_blank" rel="noopener">{{ tool.url | remove: 'https://' | remove: 'http://' | split: '/' | first }}</a></td>
      <td>{{ tool.description }}</td>
    </tr>
    {% endfor %}
  </tbody>
</table>
{% endfor %}
