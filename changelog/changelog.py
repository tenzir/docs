#!/usr/bin/env python3

# /// script
# dependencies = [
#   "python-frontmatter>=1.0.0",
#   "pyyaml>=6.0.2",
# ]
# ///

"""
Generates versioned changelog MDX files from template-based input structure.

Reads release definitions from '{dir}/releases/*.yaml' and changelog
entries from '{dir}/changes/**/*.md', then generates MDX files in
'/src/content/docs/changelog/{product}/' with proper formatting and sidebar badges.

The release YAML files contain:
- title: Release title
- description: Optional release description
- changes: Array of change file basenames (without extension)

Each change file is a markdown file with YAML frontmatter containing:
- title: Change title
- type: One of 'feature', 'change', or 'bugfix'
- authors: Author username(s)
- pr: Pull request number(s)

Formats bylines like: 'By @author1, @author2 in #pr1, #pr2.'
"""

import argparse
import re
import sys
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Union
import frontmatter
import yaml
import tempfile

# --- Configuration ---

SECTION_TITLES: Dict[str, str] = {
    "feature": "Features",
    "change": "Changes",
    "bugfix": "Bug Fixes",
}

PR_BASE_URLS: Dict[str, Optional[str]] = {
    "node": "https://github.com/tenzir/tenzir/pull/",
    "platform": "https://github.com/tenzir/platform/pull/",
}

# Maximum number of releases to show directly in sidebar before archiving
MAX_VISIBLE_RELEASES: int = 10

# --- Helper Functions ---


def validate_input_directory(dir: Path) -> bool:
    """
    Validates that the input directory has the required structure.
    Returns True if valid, False otherwise (with error messages printed).
    """
    if not dir.is_dir():
        print(f"❌ Input directory '{dir}' not found", file=sys.stderr)
        return False

    releases_dir = dir / "releases"
    changes_dir = dir / "changes"

    if not releases_dir.is_dir():
        print(f"❌ Releases directory '{releases_dir}' not found", file=sys.stderr)
        return False

    if not changes_dir.is_dir():
        print(f"❌ Changes directory '{changes_dir}' not found", file=sys.stderr)
        return False

    return True


def format_authors(authors: Union[None, str, List[str]]) -> str:
    """
    Formats authors into a comma-separated string with @ prefix and GitHub links
    Handles None, string, or list of strings
    """
    if not authors:
        return ""
    if isinstance(authors, str):
        authors = [authors]
    if not isinstance(authors, list):
        return ""
    formatted = [
        f"[@{author}](https://github.com/{author})"
        for author in authors
        if isinstance(author, str)
    ]
    return ", ".join(formatted)


def format_prs(
    prs: Union[None, int, str, List[Union[int, str]]], pr_base_url: Optional[str]
) -> str:
    """
    Formats PR numbers/IDs into a comma-separated string
    With links if pr_base_url is provided, otherwise just #-prefixed numbers
    Handles None, single value, or list of values
    """
    if not prs:
        return ""
    if isinstance(prs, (int, str)):
        prs = [prs]
    if not isinstance(prs, list):
        return ""
    formatted = []
    for pr in prs:
        if isinstance(pr, (int, str)):
            pr_str = str(pr)
            if pr_base_url:
                formatted.append(f"[#{pr_str}]({pr_base_url}{pr_str})")
            else:
                formatted.append(f"#{pr_str}")
    return ", ".join(formatted)


def parse_change_file(
    path: Path, pr_base_url: Optional[str]
) -> Optional[Tuple[str, str]]:
    """
    Parses a single changelog entry markdown file, extracts frontmatter and content,
    and validates that singular/plural key pairs (author/authors, pr/prs)
    do not coexist. Returns (type, formatted_entry) tuple or None if parsing fails.
    """
    try:
        post = frontmatter.load(path)
    except Exception as e:
        print(f"❌ Error parsing frontmatter in {path.name}: {e}", file=sys.stderr)
        return None

    has_authors_key = "authors" in post.metadata
    has_author_key = "author" in post.metadata
    has_prs_key = "prs" in post.metadata
    has_pr_key = "pr" in post.metadata

    error_messages = []
    if has_authors_key and has_author_key:
        error_messages.append("Found both 'authors' and 'author' keys")
    if has_prs_key and has_pr_key:
        error_messages.append("Found both 'prs' and 'pr' keys")

    if error_messages:
        for msg in error_messages:
            print(
                f"❌ Error in {path.name}: {msg}; Please use only one", file=sys.stderr
            )
        return None

    raw_authors = post.get("authors", post.get("author"))
    raw_prs = post.get("prs", post.get("pr"))

    title = str(post.get("title", "Untitled")).strip()
    type_ = post.get("type")
    body = post.content.strip()

    if not isinstance(type_, str) or type_ not in SECTION_TITLES:
        print(
            f"⚠️ Invalid or unknown type '{type_}' in {path.name}; skipping",
            file=sys.stderr,
        )
        return None

    authors_formatted = format_authors(raw_authors)
    prs_formatted = format_prs(raw_prs, pr_base_url)

    description = f"{body}\n\n"
    byline = f"By {authors_formatted}" if authors_formatted else ""
    if prs_formatted:
        byline += f" in {prs_formatted}."
    elif byline:
        byline += "."
    description += byline

    entry = f"#### {title}\n\n{description.strip()}"
    return type_, entry


def parse_semver(version: str) -> Optional[Tuple[int, int, int]]:
    """
    Parses a semantic version string (e.g., 'v5.0.0') and returns (major, minor, patch).
    Returns None if parsing fails.
    """
    version = version.lstrip("v")
    try:
        parts = version.split(".")
        if len(parts) != 3:
            return None
        return int(parts[0]), int(parts[1]), int(parts[2])
    except ValueError:
        return None


def parse_version_for_sorting(version: str) -> Tuple:
    """
    Creates a sort key for mixed SemVer and CalVer versions.
    SemVer versions start with 'v' and get priority (sort key starting with 0).
    CalVer versions don't start with 'v' and come after SemVer (sort key starting with 1).
    Within each category, versions are sorted newest first.
    """
    if version.startswith("v"):
        # SemVer: parse and sort reverse chronologically
        semver = parse_semver(version)
        if semver is not None:
            return (0, -semver[0], -semver[1], -semver[2])
        else:
            # Fallback for unparseable v-prefixed versions
            return (0, version)
    else:
        # CalVer: try to parse as YYYY.MM.DD format
        try:
            parts = version.split(".")
            if len(parts) == 3:
                year, month, day = map(int, parts)
                # Validate it looks like a date
                if 2000 <= year <= 3000 and 1 <= month <= 12 and 1 <= day <= 31:
                    # CalVer: (1, -year, -month, -day) for reverse sorting
                    return (1, -year, -month, -day)
        except ValueError:
            pass

        # Fallback for unparseable non-v versions: sort last alphabetically
        return (2, version)


def get_badge_variant(version: str) -> str:
    """
    Determines the sidebar badge variant based on version bump type.
    - Major bump (X.0.0) → 'note'
    - Minor bump (x.Y.0) → 'success'
    - Patch bump (x.y.Z) → 'tip'
    Defaults to 'tip' if version parsing fails.
    """
    semver = parse_semver(version)
    if not semver:
        return "tip"

    major, minor, patch = semver
    if minor == 0 and patch == 0:
        return "note"  # Major version
    elif patch == 0:
        return "success"  # Minor version
    else:
        return "tip"  # Patch version


def load_changes_map(changes_dir: Path) -> Dict[str, Path]:
    """
    Loads all change files from the changes directory and creates a map
    from basename (without extension) to full path.
    """
    changes_map = {}
    for change_file in changes_dir.rglob("*.md"):
        if change_file.is_file():
            basename = change_file.stem
            if basename in changes_map:
                print(
                    f"⚠️ Duplicate change file basename '{basename}' found at {change_file} and {changes_map[basename]}",
                    file=sys.stderr,
                )
            changes_map[basename] = change_file
    return changes_map


def process_release(
    release_file: Path,
    changes_map: Dict[str, Path],
    output_path: Path,
    pr_base_url: Optional[str],
) -> bool:
    """
    Processes a single release YAML file and generates the corresponding MDX changelog.
    Returns True on success, False on failure.
    """
    try:
        with open(release_file, "r") as f:
            release_data = yaml.safe_load(f)
    except Exception as e:
        print(
            f"❌ Error loading release file {release_file.name}: {e}", file=sys.stderr
        )
        return False

    if not isinstance(release_data, dict):
        print(f"❌ Invalid release file format in {release_file.name}", file=sys.stderr)
        return False

    title = release_data.get("title", "")
    description = release_data.get("description", "").strip()
    changes = release_data.get("changes", [])

    if not isinstance(changes, list):
        print(f"❌ 'changes' must be a list in {release_file.name}", file=sys.stderr)
        return False

    # Parse version from filename
    version = release_file.stem  # e.g., 'v5.0.0'
    filename_version = version.replace(".", "-")  # e.g., 'v5-0-0'

    # Process changes
    entries: Dict[str, List[str]] = {type_: [] for type_ in SECTION_TITLES}
    valid_entry_found = False

    for change_ref in changes:
        if not isinstance(change_ref, str):
            print(
                f"⚠️ Invalid change reference '{change_ref}' in {release_file.name}; skipping",
                file=sys.stderr,
            )
            continue

        if change_ref not in changes_map:
            print(
                f"⚠️ Change file '{change_ref}' referenced in {release_file.name} not found; skipping",
                file=sys.stderr,
            )
            continue

        result = parse_change_file(changes_map[change_ref], pr_base_url)
        if result:
            type_, entry = result
            entries[type_].append(entry)
            valid_entry_found = True

    # Allow releases with only title and description, no entries required
    if not valid_entry_found and not title and not description:
        print(
            f"⚠️ No valid changelog entries, title, or description found for {release_file.name}; skipping",
            file=sys.stderr,
        )
        return False

    # Generate MDX file
    try:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "w") as f:
            # Write frontmatter
            f.write("---\n")
            f.write(f"title: {title or version}\n")
            if version != "next":
                f.write("sidebar:\n")
                f.write("  badge:\n")
                f.write(f"    text: {version}\n")
                f.write(f"    variant: {get_badge_variant(version)}\n")
            f.write("---\n\n")

            # Collect content parts to write
            content_parts = []

            # Add description if present
            if description:
                content_parts.append(description)

            # Add sections if present
            sections_written = []
            for type_key in SECTION_TITLES:
                if entries[type_key]:
                    section_content = f"### {SECTION_TITLES[type_key]}\n\n"
                    section_content += "\n\n".join(entries[type_key])
                    sections_written.append(section_content)

            if sections_written:
                content_parts.append("\n\n".join(sections_written))

            # Write content with proper spacing
            if content_parts:
                f.write("\n\n".join(content_parts))
                f.write("\n")

        try:
            print(f"✅ Generated {output_path.relative_to(Path.cwd())}")
        except ValueError:
            print(f"✅ Generated {output_path}")
        return True

    except IOError as e:
        print(f"❌ Error writing to output file {output_path}: {e}", file=sys.stderr)
        return False


def parse_filename_semver_key(filename_stem: str) -> Tuple:
    """
    Creates a sort key for semantic versioning from filenames like 'v5-0-0'
    Handles 'v' prefix and uses dashes as separators. Non-semver strings
    are sorted last alphabetically. Used for sidebar sorting
    """
    version_str = filename_stem.lstrip("v").replace("-", ".")
    try:
        parts = tuple(map(int, version_str.split(".")))
        return parts
    except ValueError:
        return (float("inf"), filename_stem)  # Sort non-parseable very last


def generate_product_index(
    product: str, versions_info: List[Tuple[str, str]], output_dir: Path
) -> bool:
    """
    Generates the index.mdx file for a product with links to all versions.
    """
    try:
        index_path = output_dir / "index.mdx"

        # Sort versions with 'next' first, then reverse chronological
        next_version = None
        other_versions = []

        for version_name, filename_version in versions_info:
            if version_name == "next":
                next_version = (version_name, filename_version)
            else:
                other_versions.append((version_name, filename_version))

        # Sort other versions with SemVer first, then CalVer (newest first within each category)
        other_versions.sort(key=lambda x: parse_version_for_sorting(x[0]))

        # Build sorted list
        sorted_versions = []
        if next_version:
            sorted_versions.append(next_version)
        sorted_versions.extend(other_versions)

        # Generate content
        product_title = f"Tenzir {product.capitalize()}"
        content = f"""---
title: {product_title} Changelog
---

This page lists the changelog for {product_title}.

## Versions

"""

        # Add version links
        for version_name, filename_version in sorted_versions:
            if version_name == "next":
                link_text = "Next (Unreleased)"
            else:
                link_text = f"Version {version_name.lstrip('v')}"
            content += f"* [{link_text}](/changelog/{product}/{filename_version})\n"

        # Write file
        with open(index_path, "w") as f:
            f.write(content)

        try:
            print(f"✅ Generated product index: {index_path.relative_to(Path.cwd())}")
        except ValueError:
            print(f"✅ Generated product index: {index_path}")
        return True

    except IOError as e:
        print(f"❌ Error writing product index {index_path}: {e}", file=sys.stderr)
        return False


def update_sidebar_file(
    product: str, versions_info: List[Tuple[str, str]], sidebar_path: Path
) -> bool:
    """
    Updates TypeScript sidebar definition for a single product's changelog entries.
    Writes to product-specific sidebar file.
    versions_info is a list of (version_name, filename_version) tuples.
    """
    try:
        # Sort versions
        next_version = None
        other_versions = []

        for version_name, filename_version in versions_info:
            if version_name == "next":
                next_version = (version_name, filename_version)
            elif version_name.startswith("v"):
                semver = parse_semver(version_name)
                if semver:
                    # For node product, only include v4+ (Tenzir) versions to exclude old VAST v1-v3 versions
                    # For platform product, include all versions
                    if product == "platform" or semver[0] >= 4:
                        other_versions.append((version_name, filename_version, semver))

        # Sort by semver (newest first)
        other_versions.sort(key=lambda x: x[2], reverse=True)

        # Generate TypeScript paths for this product
        ts_paths = []
        ts_archive_paths = []

        # Always include "next" entry regardless of whether it exists
        ts_paths.append(f'  "changelog/{product}/next",')

        # Split releases into visible and archived based on MAX_VISIBLE_RELEASES
        for i, (version_name, filename_version, _) in enumerate(other_versions):
            path_entry = f"changelog/{product}/{filename_version}"
            if i < MAX_VISIBLE_RELEASES:
                ts_paths.append(path_entry)
            else:
                ts_archive_paths.append(path_entry)

        # Generate TypeScript content for this product only
        ts_content = "// Generated by changelog.py\n\n"
        if ts_paths or ts_archive_paths:
            ts_content += f"export const changelog_{product} = [\n"
            for path in ts_paths:
                ts_content += f"  {path},\n"

            # Add archive section if there are archived releases
            if ts_archive_paths:
                ts_content += f'  {{\n'
                ts_content += f'    label: "Archive",\n'
                ts_content += f'    collapsed: true,\n'
                ts_content += f'    items: [\n'
                for path in ts_archive_paths:
                    ts_content += f"    {path},\n"
                ts_content += f'    ],\n'
                ts_content += f'  }},\n'

            ts_content += "];\n"
        else:
            ts_content += f"export const changelog_{product} = [];\n"

        # Write file
        sidebar_path.parent.mkdir(parents=True, exist_ok=True)
        with open(sidebar_path, "w") as f:
            f.write(ts_content.rstrip() + "\n")

        try:
            print(f"✅ Updated sidebar file: {sidebar_path.relative_to(Path.cwd())}")
        except ValueError:
            print(f"✅ Updated sidebar file: {sidebar_path}")
        return True

    except IOError as e:
        print(f"❌ Error writing sidebar file {sidebar_path}: {e}", file=sys.stderr)
        return False


def find_unreferenced_changes(
    release_files: List[Path], changes_map: Dict[str, Path]
) -> List[str]:
    """
    Finds all changes that are not referenced in any release.
    Returns a list of change basenames.
    """
    # Collect all referenced changes from all releases
    referenced_changes = set()
    for release_file in release_files:
        try:
            with open(release_file, "r") as f:
                release_data = yaml.safe_load(f)
            if isinstance(release_data, dict) and isinstance(
                release_data.get("changes"), list
            ):
                for change in release_data["changes"]:
                    if isinstance(change, str):
                        referenced_changes.add(change)
        except Exception:
            # Skip problematic files
            pass

    # Find unreferenced changes
    all_changes = set(changes_map.keys())
    unreferenced = all_changes - referenced_changes

    return sorted(list(unreferenced))


def generate_next_release(
    unreferenced_changes: List[str], releases_dir: Path
) -> Optional[Path]:
    """
    Generates a temporary 'next.yaml' file with unreferenced changes.
    Returns the path to the generated file, or None if no unreferenced changes.
    """
    if not unreferenced_changes:
        return None

    next_file = releases_dir / "next.yaml"

    # Generate next release content
    content = {
        "title": "Next",
        "description": "Unreleased changes.",
        "changes": unreferenced_changes,
    }

    try:
        with open(next_file, "w") as f:
            yaml.dump(content, f, default_flow_style=False, sort_keys=False)
        return next_file
    except Exception as e:
        print(f"❌ Error creating next.yaml: {e}", file=sys.stderr)
        return None


def main():
    """Main function to orchestrate changelog generation."""
    parser = argparse.ArgumentParser(
        description="Generate changelog MDX files from template-based input structure"
    )
    parser.add_argument(
        "--product",
        required=True,
        choices=["node", "platform"],
        help="Product name (either 'node' or 'platform')",
    )
    parser.add_argument(
        "dir",
        type=Path,
        help="Path to template directory containing 'releases' and 'changes' subdirectories",
    )
    args = parser.parse_args()

    # Validate input directory structure
    if not validate_input_directory(args.dir):
        sys.exit(1)

    # Set up paths
    script_dir = Path(__file__).parent.resolve()
    output_dir = (
        script_dir.parent / "src" / "content" / "docs" / "changelog" / args.product
    )
    sidebar_path = script_dir.parent / "src" / f"sidebar-changelog-{args.product}.ts"

    releases_dir = args.dir / "releases"
    changes_dir = args.dir / "changes"

    # Get PR base URL for the product
    pr_base_url = PR_BASE_URLS.get(args.product)

    print(f"ℹ️ Processing changelog for '{args.product}' product")
    try:
        print(f"ℹ️ Input directory: {args.dir.relative_to(Path.cwd())}")
    except ValueError:
        print(f"ℹ️ Input directory: {args.dir}")
    try:
        print(f"ℹ️ Output directory: {output_dir.relative_to(Path.cwd())}")
    except ValueError:
        print(f"ℹ️ Output directory: {output_dir}")

    # Load all changes
    changes_map = load_changes_map(changes_dir)
    print(f"ℹ️ Found {len(changes_map)} change files")

    # Process all releases
    release_files = sorted(releases_dir.glob("*.yaml"))
    if not release_files:
        print(f"⚠️ No release files found in {releases_dir}")
        sys.exit(0)

    print(f"ℹ️ Found {len(release_files)} release files")

    # Find unreferenced changes and generate next release if needed
    unreferenced = find_unreferenced_changes(release_files, changes_map)
    next_file = None

    # Always generate a next.mdx file
    if unreferenced:
        print(
            f"ℹ️ Found {len(unreferenced)} unreferenced changes, generating 'next' release"
        )
        next_file = generate_next_release(unreferenced, releases_dir)
        if next_file:
            release_files.append(next_file)
            release_files.sort()  # Re-sort to ensure proper order
    else:
        # Create an empty next.mdx file if no unreferenced changes
        print("ℹ️ No unreferenced changes, creating empty 'next' release")
        next_output_path = output_dir / "next.mdx"
        try:
            next_output_path.parent.mkdir(parents=True, exist_ok=True)
            with open(next_output_path, "w") as f:
                f.write("---\n")
                f.write("title: Next\n")
                f.write("---\n\n")
                f.write("Unreleased changes.\n")
            print(f"✅ Generated: {next_output_path.name}")
        except Exception as e:
            print(f"❌ Error creating empty next.mdx: {e}", file=sys.stderr)

    success_count = 0
    versions_info = []
    for release_file in release_files:
        version = release_file.stem
        filename_version = version.replace(".", "-")
        output_path = output_dir / f"{filename_version}.mdx"

        if process_release(release_file, changes_map, output_path, pr_base_url):
            success_count += 1
            versions_info.append((version, filename_version))

    # Clean up temporary next.yaml if it was created
    if next_file and next_file.exists():
        try:
            next_file.unlink()
        except Exception:
            pass

    print(f"\n✅ Successfully generated {success_count} changelog files")

    # Generate product index
    if not generate_product_index(args.product, versions_info, output_dir):
        print("❌ Failed to generate product index", file=sys.stderr)
        sys.exit(1)

    # Update sidebar file
    if not update_sidebar_file(args.product, versions_info, sidebar_path):
        print("❌ Failed to update sidebar file", file=sys.stderr)
        sys.exit(1)

    if success_count < len(release_files):
        sys.exit(1)


if __name__ == "__main__":
    main()
