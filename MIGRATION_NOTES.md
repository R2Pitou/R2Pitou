# Migration Notes

## Summary

Converted the repository into a GitHub-native Jekyll POSSE publishing site for `working-draft.org`.

The article model uses a Jekyll collection at `_articles/` so article filenames can be title-based, for example:

```text
_articles/GitHub-native-POSSE-publishing.md
```

The canonical article URL is still controlled by front matter category plus filename slug:

```text
https://working-draft.org/architecture/github-native-posse-publishing/
```

## Protected Paths

- `cv/` existed before migration and was treated as protected.
- `arttu/` existed before migration and was treated as protected.
- No files inside `cv/` were intentionally modified.
- No files inside `arttu/` were intentionally modified.

## Suspicious Arttu-Like Paths

Inspected root and recursive directory names for obvious malformed variants of `arttu`.

Found:

- `arttu/` - canonical protected path, left untouched.

No typo-like duplicate paths such as `arttu.u/`, `artttu/`, `artu/`, or `artuu/` were found.

No redirects from typo paths were created.

## Other Changes

- Added Jekyll configuration, layouts, includes, article collection, JSON Feed, robots.txt, posting guide, and syndication dry-run workflow.
- Added `assets/images/` as the single flat folder for article images.
- Self-hosted site fonts under `assets/fonts/` instead of linking to third-party font CDNs.
- Added an explicit canonical lowercase permalink for the example article and a compatibility redirect from the mixed-case URL.
- Added automatic article permalink/canonical and image filename checks through GitHub Actions.
- Kept `README.md` intact for the GitHub profile README.
- Kept `CNAME` as `working-draft.org`.
