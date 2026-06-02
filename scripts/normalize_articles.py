#!/usr/bin/env python3
"""Normalize Working Draft article and image filenames.

Default mode renames files in articles/ to lowercase kebab-case and updates:
- permalink
- canonical_url
- date

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
ARTICLES = ROOT / "articles"
IMAGES = ROOT / "assets" / "images"
SITE_URL = "https://working-draft.org"


def slugify(value: str) -> str:
    # Slugify folder/file names to lowercase kebab-case
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", value).strip("-").lower()
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


def normalize_date(date_str: str) -> str:
    # Normalize date string to format: YYYY-MM-DD HH:MM:SS +0700
    pattern = re.compile(
        r"^(\d{4}-\d{2}-\d{2})(?:[T ](\d{2}:\d{2}(?::\d{2})?))?\s*(?:([+-]\d{2}:?\d{2}))?$"
    )
    match = pattern.match(date_str.strip())
    if not match:
        raise ValueError(f"Date '{date_str}' does not match expected format YYYY-MM-DD")

    date_part = match.group(1)
    time_part = match.group(2)
    tz_part = match.group(3)

    if not time_part:
        time_part = "09:00:00"
    elif len(time_part) == 5:
        time_part = f"{time_part}:00"

    if not tz_part:
        tz_part = "+0700"
    else:
        tz_part = tz_part.replace(":", "")

    return f"{date_part} {time_part} {tz_part}"


def normalize_directories(write: bool) -> bool:
    # Post-order traversal to rename deepest directories first
    changed = False
    dirs = []
    if not ARTICLES.exists():
        return False

    for p in ARTICLES.rglob("*"):
        if p.is_dir():
            dirs.append(p)

    # Sort by depth descending (longest paths first)
    dirs.sort(key=lambda x: len(x.parts), reverse=True)

    for d in dirs:
        expected_name = slugify(d.name)
        if d.name != expected_name:
            target = d.with_name(expected_name)
            if not write:
                print(f"Directory needs normalization: {d.relative_to(ROOT)} -> {target.relative_to(ROOT)}")
                changed = True
            else:
                safe_rename(d, target)
                print(f"Normalized directory: {d.relative_to(ROOT)} -> {target.relative_to(ROOT)}")
                changed = True
    return changed


def normalize_file(path: Path, write: bool) -> bool:
    text = path.read_text(encoding="utf-8")
    front, body = split_front_matter(text, path)

    # Determine category and slug from relative path under ARTICLES (articles/)
    rel_path = path.relative_to(ARTICLES)
    parts = rel_path.parts

    if len(parts) >= 3:
        category = parts[0]
        slug = parts[-2]
    elif len(parts) == 2:
        category = ""
        slug = parts[0]
    else:
        category = ""
        slug = path.stem

    expected_filename = path.name.lower()
    expected_path = path.with_name(expected_filename)
    
    file_renamed = path.name != expected_filename

    # Build expected permalink
    if category:
        expected_permalink = f"/{category}/{slug}/"
    else:
        expected_permalink = f"/{slug}/"

    # Build expected canonical_url
    current_canonical = scalar_front_matter(front, "canonical_url")
    if current_canonical and not current_canonical.startswith(SITE_URL) and not current_canonical.startswith("/"):
        expected_canonical = current_canonical
    else:
        expected_canonical = f"{SITE_URL}{expected_permalink}"

    # Normalize date
    current_date = scalar_front_matter(front, "date")
    if current_date:
        expected_date = normalize_date(current_date)
    else:
        expected_date = ""

    changed = file_renamed
    
    if category:
        front, fm_changed = set_front_matter(front, "categories", category)
        changed = changed or fm_changed

    front, fm_changed = set_front_matter(front, "permalink", expected_permalink, after="categories" if category else None)
    changed = changed or fm_changed

    front, fm_changed = set_front_matter(front, "canonical_url", expected_canonical, after="permalink")
    changed = changed or fm_changed

    if expected_date:
        front, fm_changed = set_front_matter(front, "date", expected_date, after="title")
        changed = changed or fm_changed

    if changed and not write:
        print(f"Needs normalization: {path.relative_to(ROOT)}")
        print(f"  permalink: {expected_permalink}")
        print(f"  canonical_url: {expected_canonical}")
        if expected_date:
            print(f"  date: {expected_date}")
        return True

    if changed and write:
        new_text = "\n".join(front + body) + "\n"
        path.write_text(new_text, encoding="utf-8")
        if file_renamed:
            safe_rename(path, expected_path)
            print(f"Normalized file name: {path.relative_to(ROOT)} -> {expected_path.relative_to(ROOT)}")
        else:
            print(f"Normalized front matter: {path.relative_to(ROOT)}")
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
        dir_changed = normalize_directories(write=write)
        changed = changed or dir_changed

        if ARTICLES.exists():
            for path in sorted(ARTICLES.rglob("*")):
                if path.is_file() and path.suffix in [".md", ".html"]:
                    try:
                        with open(path, "r", encoding="utf-8") as f:
                            first_line = f.readline().strip()
                            if first_line == "---":
                                changed = normalize_file(path, write=write) or changed
                    except Exception:
                        continue

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
