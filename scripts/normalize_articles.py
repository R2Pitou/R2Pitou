#!/usr/bin/env python3
"""Normalize Working Draft article and image filenames.

Default mode renames files in _articles/ to lowercase kebab-case and updates:
- permalink
- canonical_url

It also renames files in assets/images/ to lowercase kebab-case while keeping
their file extensions.

Use --check in CI to fail when normalization is needed.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ARTICLES = ROOT / "_articles"
IMAGES = ROOT / "assets" / "images"
SITE_URL = "https://working-draft.org"


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "untitled"


def split_front_matter(text: str, path: Path) -> tuple[list[str], list[str]]:
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        raise ValueError(f"{path}: front matter must start at line 1")

    for index in range(1, len(lines)):
        if lines[index].strip() == "---":
            return lines[: index + 1], lines[index + 1 :]

    raise ValueError(f"{path}: front matter must end with ---")


def scalar_front_matter(front: list[str], key: str) -> str:
    pattern = re.compile(rf"^{re.escape(key)}:\s*(.+?)\s*$")
    for line in front:
        match = pattern.match(line)
        if match:
            return match.group(1).strip().strip('"').strip("'")
    return ""


def set_front_matter(front: list[str], key: str, value: str, after: str | None = None) -> tuple[list[str], bool]:
    pattern = re.compile(rf"^{re.escape(key)}:\s*")
    changed = False

    for index, line in enumerate(front):
        if pattern.match(line):
            new_line = f"{key}: {value}"
            if line != new_line:
                front[index] = new_line
                changed = True
            return front, changed

    insert_at = len(front) - 1
    if after:
        after_pattern = re.compile(rf"^{re.escape(after)}:\s*")
        for index, line in enumerate(front):
            if after_pattern.match(line):
                insert_at = index + 1
                break

    front.insert(insert_at, f"{key}: {value}")
    return front, True


def safe_rename(source: Path, target: Path) -> None:
    if source.name == target.name and source.parent == target.parent:
        return

    if target.exists() and source.resolve() != target.resolve():
        raise FileExistsError(f"Cannot rename {source.name} to {target.name}: target exists")

    temp = source.with_name(f".__normalize_tmp__{source.name}")
    source.rename(temp)
    temp.rename(target)


def normalize_file(path: Path, write: bool) -> bool:
    text = path.read_text(encoding="utf-8")
    front, body = split_front_matter(text, path)

    category = scalar_front_matter(front, "categories")
    if not category:
        raise ValueError(f"{path}: missing categories")
    if any(token in category for token in [",", "[", "]"]):
        raise ValueError(f"{path}: use exactly one scalar category")

    slug = slugify(path.stem)
    expected_name = f"{slug}.md"
    expected_path = path.with_name(expected_name)
    expected_permalink = f"/{category}/{slug}/"
    expected_canonical = f"{SITE_URL}{expected_permalink}"

    changed = path.name != expected_name
    front, front_changed = set_front_matter(front, "permalink", expected_permalink, after="categories")
    changed = changed or front_changed
    front, front_changed = set_front_matter(front, "canonical_url", expected_canonical, after="permalink")
    changed = changed or front_changed

    if changed and not write:
        print(f"Needs normalization: {path.relative_to(ROOT)} -> {expected_path.relative_to(ROOT)}")
        print(f"  permalink: {expected_permalink}")
        print(f"  canonical_url: {expected_canonical}")
        return True

    if changed and write:
        new_text = "\n".join(front + body) + "\n"
        path.write_text(new_text, encoding="utf-8")
        safe_rename(path, expected_path)
        print(f"Normalized: {path.relative_to(ROOT)} -> {expected_path.relative_to(ROOT)}")
        return True

    return False


def normalize_image(path: Path, write: bool) -> bool:
    if path.name == ".gitkeep":
        return False
    if path.is_dir():
        raise ValueError(f"{path}: assets/images must stay flat; directories are not allowed")

    slug = slugify(path.stem)
    suffix = path.suffix.lower()
    expected_path = path.with_name(f"{slug}{suffix}")
    changed = path.name != expected_path.name

    if changed and not write:
        print(f"Needs normalization: {path.relative_to(ROOT)} -> {expected_path.relative_to(ROOT)}")
        return True

    if changed and write:
        safe_rename(path, expected_path)
        print(f"Normalized: {path.relative_to(ROOT)} -> {expected_path.relative_to(ROOT)}")
        return True

    return False


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="Report required changes and exit non-zero.")
    args = parser.parse_args()

    write = not args.check
    changed = False

    try:
        if ARTICLES.exists():
            for path in sorted(ARTICLES.glob("*.md")):
                changed = normalize_file(path, write=write) or changed

        if IMAGES.exists():
            for path in sorted(IMAGES.iterdir()):
                changed = normalize_image(path, write=write) or changed
    except Exception as error:
        print(f"ERROR: {error}", file=sys.stderr)
        return 1

    if args.check and changed:
        print("Run: python scripts/normalize_articles.py")
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
