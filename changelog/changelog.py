#!/usr/bin/env python3
"""
Generates versioned changelog MDX files and a product index file.
Optionally generates a TypeScript sidebar definition file.

Reads markdown files from product-specific source directories containing
version subdirectories (e.g., 'node/next/', 'node/v5.0.0/') and writes
aggregated MDX files to a central output directory (configurable via
--output-dir, default: 'mdx'), mirroring the product/version structure
(e.g., 'mdx/node/v5-0-0.mdx').

Replaces dots in version names with dashes for the output filenames.
Version MDX file titles will be the raw version name (e.g., 'v5.1.3'),
except for 'next' which will have the title 'Next'.

Generates an 'index.mdx' within each product's output directory, containing
a title, intro, and sorted links (without .mdx suffix) to the generated
version files.

If --sidebar-file is provided (optionally specify path, defaults to
'sidebar-changelog.ts' if path omitted), generates a TypeScript file
containing arrays of sorted paths (prefixed with 'changelog/') for each
product, suitable for sidebar navigation.

It handles aliased frontmatter keys ('author'/'authors', 'pr'/'prs') but
will report an error and skip files where both aliases coexist.

Formats bylines like: 'By @author1, @author2 in #pr1, #pr2.'
"""

from pathlib import Path
from collections import defaultdict
from typing import Union, List, Dict, Optional, Tuple
import frontmatter
import sys
import argparse # For command-line argument parsing

# --- Configuration ---

PRODUCTS: Dict[str, Dict[str, Union[Path, str, None]]] = {
    "node": {
        "title": "Tenzir Node Changelog",
        "path": Path("node"),
        "pr_base_url": "https://github.com/tenzir/tenzir/pull/",
    },
    "platform": {
        "title": "Tenzir Platform Changelog",
        "path": Path("platform"),
        "pr_base_url": None, # No PR links for private repos
    },
}

SECTION_TITLES: Dict[str, str] = {
    "feature": "Features",
    "change": "Changes",
    "bugfix": "Bug Fixes",
}

# --- Helper Functions ---

def format_authors(authors_data: Union[str, List[str], None]) -> str:
    """Formats author(s) into markdown links like '@author' joined by ', '"""
    authors_list: List[str] = []
    match authors_data:
        case str():
            author_str = authors_data.strip()
            if author_str: authors_list = [author_str]
        case list():
            authors_list = [str(a).strip() for a in authors_data if isinstance(a, (str, int))]
            authors_list = [a for a in authors_list if a]
        case _:
            return ""
    if not authors_list: return ""
    return ", ".join(f"[@{a}](https://github.com/{a})" for a in authors_list)

def format_prs(prs_data: Union[int, str, List[Union[int, str]], None], base_url: Optional[str]) -> str:
    """Formats PR number(s) into markdown links like '#pr' joined by ', ' (no angle brackets)"""
    if prs_data is None or base_url is None: return ""
    prs_list: List[str] = []
    match prs_data:
        case int() | str():
            pr_str = str(prs_data).strip()
            if pr_str: prs_list = [pr_str]
        case list():
            prs_list = [str(pr).strip() for pr in prs_data if isinstance(pr, (int, str))]
            prs_list = [pr for pr in prs_list if pr]
        case _:
            print(f"⚠️ Unexpected type for 'prs' value: {type(prs_data).__name__} in frontmatter; Skipping PR formatting", file=sys.stderr)
            return ""
    if not prs_list: return ""
    return ", ".join(f"[#{pr}]({base_url}{pr})" for pr in prs_list)

def parse_file(path: Path, pr_base_url: Optional[str]) -> Optional[Tuple[str, str]]:
    """
    Parses a single markdown file, extracts frontmatter and content,
    and validates that singular/plural key pairs (author/authors, pr/prs)
    do not coexist. Returns None if parsing fails or validation fails
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
            print(f"❌ Error in {path.name}: {msg}; Please use only one", file=sys.stderr)
        return None

    raw_authors = post.get("authors", post.get("author"))
    raw_prs = post.get("prs", post.get("pr"))

    title = str(post.get("title", "Untitled")).strip()
    type_ = post.get("type")
    body = post.content.strip()

    if not isinstance(type_, str) or type_ not in SECTION_TITLES:
        print(f"⚠️ Invalid or unknown type '{type_}' in {path.name}; skipping", file=sys.stderr)
        return None

    authors_formatted = format_authors(raw_authors)
    prs_formatted = format_prs(raw_prs, pr_base_url)

    description = f"{body}\n\n"
    byline = f"By {authors_formatted}" if authors_formatted else ""
    if prs_formatted:
        byline += f" in {prs_formatted}." # Period added here
    elif byline:
        byline += "." # Period added here if only authors
    description += byline

    entry = f"### {title}\n\n{description.strip()}\n"
    return type_, entry

def parse_filename_semver_key(filename_stem: str) -> Tuple:
    """
    Creates a sort key for semantic versioning from filenames like 'v5-0-0'
    Handles 'v' prefix and uses dashes as separators. Non-semver strings
    are sorted last alphabetically. Used for sidebar sorting
    """
    version_str = filename_stem.lstrip('v').replace('-', '.')
    try:
        parts = tuple(map(int, version_str.split('.')))
        return parts
    except ValueError:
        return (float('inf'), filename_stem) # Sort non-parseable very last

# --- Core Logic ---

def generate_version_changelog(version_src_path: Path, output_path: Path, pr_base_url: Optional[str]) -> bool:
    """
    Generates a single changelog MDX file for a specific version directory
    Returns True on success, False on failure or skip
    """
    entries: Dict[str, List[str]] = defaultdict(list)
    version_name = version_src_path.name

    print(f"ℹ️ Processing version source: {version_src_path.relative_to(Path.cwd())} -> {output_path.relative_to(Path.cwd())}")

    md_files = sorted(version_src_path.glob("*.md"))
    if not md_files:
        print(f"ℹ️ No *.md files found in source {version_src_path.relative_to(Path.cwd())}; skipping")
        return False

    valid_entry_found = False
    for md_file in md_files:
        result = parse_file(md_file, pr_base_url)
        if result:
            type_, entry = result
            entries[type_].append(entry)
            valid_entry_found = True

    if not valid_entry_found:
        print(f"ℹ️ No valid changelog entries extracted from source {version_src_path.relative_to(Path.cwd())}; skipping output")
        return False

    try:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "w") as f:
            f.write("---\n")
            if version_name == 'next':
                title_in_frontmatter = "Next"
            else:
                title_in_frontmatter = version_name
            f.write(f"title: {title_in_frontmatter}\n")
            f.write("---\n\n")

            content_written = False
            for type_key in SECTION_TITLES:
                if entries[type_key]:
                    content_written = True
                    f.write(f"## {SECTION_TITLES[type_key]}\n\n")
                    f.write("\n\n".join(entries[type_key]))
                    f.write("\n\n")

            if content_written:
                f.seek(f.tell() - 2)
                f.truncate()

        print(f"✅ Generated {output_path.relative_to(Path.cwd())}")
        return True

    except IOError as e:
        print(f"❌ Error writing to output file {output_path}: {e}", file=sys.stderr)
    except OSError as e:
         print(f"❌ Error creating directory {output_path.parent}: {e}", file=sys.stderr)

    return False


def generate_product_index(product_name: str, product_title: str, versions_info: List[Tuple[str, str]], product_output_dir: Path):
    """Generates the index.mdx file for a product, linking (without .mdx) to its version pages"""
    index_path = product_output_dir / "index.mdx"
    product_output_dir.mkdir(parents=True, exist_ok=True)

    # --- Sort the versions for the index page link order ---
    next_version_info = None
    other_versions_info = []
    for v_info in versions_info:
        if v_info[0] == 'next':
            next_version_info = v_info
        else:
            other_versions_info.append(v_info)

    def parse_semver_key_index(v_tuple: Tuple[str, str]) -> Tuple:
        version_str = v_tuple[0].lstrip('v')
        try:
            parts = tuple(map(int, version_str.split('.')))
            return parts
        except ValueError:
            return (-1, version_str)

    other_versions_info.sort(key=parse_semver_key_index, reverse=True) # Newest first

    sorted_versions_info = []
    if next_version_info:
        sorted_versions_info.append(next_version_info)
    sorted_versions_info.extend(other_versions_info)
    # --- End Index Sorting ---

    print(f"ℹ️ Generating product index: {index_path.relative_to(Path.cwd())}")

    try:
        with open(index_path, "w") as f:
            f.write("---\n")
            f.write(f"title: {product_title}\n")
            f.write("---\n\n")
            f.write(f"This page lists the changelogs for {product_title}\n\n")
            f.write("## Versions\n\n")

            if not sorted_versions_info:
                 f.write("No versions found\n")
            else:
                for version_name, filename_version in sorted_versions_info:
                    link_target = filename_version
                    if version_name == 'next':
                        link_text = "Next (Unreleased)"
                    else:
                        link_text = f"Version {version_name.lstrip('v')}"
                    f.write(f"* [{link_text}]({link_target})\n")

        print(f"✅ Generated {index_path.relative_to(Path.cwd())}")

    except IOError as e:
        print(f"❌ Error writing to index file {index_path}: {e}", file=sys.stderr)
    except OSError as e:
        print(f"❌ Error creating directory for index {index_path.parent}: {e}", file=sys.stderr)


def process_product(
    output_dir: Path, # Pass configured output directory
    product_name: str,
    product_title: str,
    product_src_path: Path,
    pr_base_url: Optional[str]
) -> Optional[List[Tuple[str, str]]]:
    """
    Processes a product, generating changelogs into output_dir and an index file
    Returns the list of processed version info tuples
    [(version_name, filename_version), ...] on success, or None on failure/skip
    """
    if not product_src_path.is_dir():
        print(f"⚠️ Product source path '{product_src_path}' for '{product_name}' not found; skipping", file=sys.stderr)
        return None

    print(f"ℹ️ Processing product '{product_name}' in source '{product_src_path.relative_to(Path.cwd())}'")

    processed_versions_info: List[Tuple[str, str]] = []
    product_output_dir = output_dir / product_name

    versions_found = False
    for version_src_path in sorted(product_src_path.iterdir()):
        if version_src_path.is_dir():
            versions_found = True
            version_name = version_src_path.name
            filename_version = version_name.replace('.', '-')
            target_output_path = product_output_dir / f"{filename_version}.mdx"

            if generate_version_changelog(version_src_path, target_output_path, pr_base_url):
                processed_versions_info.append((version_name, filename_version))

    if not versions_found:
         print(f"ℹ️ No version subdirectories found in {product_src_path.relative_to(Path.cwd())} for '{product_name}'")
         return [] if product_src_path.exists() else None

    if processed_versions_info:
        generate_product_index(product_name, product_title, processed_versions_info, product_output_dir)
        return processed_versions_info
    else:
         print(f"ℹ️ No version changelogs were successfully generated for '{product_name}'; skipping index generation")
         return []


def generate_sidebar_file(
    all_products_info: Dict[str, List[Tuple[str, str]]],
    sidebar_file_path: Path):
    """Generates the complete TypeScript sidebar definition file"""

    print(f"ℹ️ Generating sidebar definition file: {sidebar_file_path}")
    ts_outputs: List[str] = []

    for product_name in sorted(all_products_info.keys()):
        versions_info = all_products_info[product_name]
        if not versions_info: continue

        filenames_stems = [fname for _, fname in versions_info]

        # --- Sort Filenames for Sidebar ---
        next_filename = None
        other_filenames = []
        for fname in filenames_stems:
             if fname == 'next':
                 next_filename = fname
             else:
                 other_filenames.append(fname)

        other_filenames.sort(key=parse_filename_semver_key, reverse=True) # Newest first

        sorted_filenames = []
        if next_filename:
            sorted_filenames.append(next_filename)
        sorted_filenames.extend(other_filenames)
        # --- End Sidebar Sorting ---

        # --- Generate TypeScript Paths ---
        ts_paths = [
            f"  'changelog/{product_name}/{fname}'," # Hardcoded 'changelog/' prefix
            for fname in sorted_filenames
        ]

        # --- Generate TypeScript Block ---
        ts_variable_name = f"changelog_{product_name.replace('-', '_')}"
        ts_block = f"""export const {ts_variable_name} = [
{'\n'.join(ts_paths)}
];"""
        ts_outputs.append(ts_block)
        print(f"✅ Prepared sidebar definition for '{product_name}'")

    # --- Write Output File ---
    if not ts_outputs:
        print("ℹ️ No product definitions generated for sidebar file")
        return

    try:
        sidebar_file_path.parent.mkdir(parents=True, exist_ok=True)
        with open(sidebar_file_path, "w") as f:
            f.write("// Generated by changelog.py --sidebar-file\n\n")
            f.write('\n\n'.join(ts_outputs))
            f.write('\n')
        print(f"✅ Generated sidebar file: {sidebar_file_path}")
    except IOError as e:
        print(f"❌ Error writing to sidebar file {sidebar_file_path}: {e}", file=sys.stderr)
    except OSError as e:
        print(f"❌ Error creating directory for sidebar file {sidebar_file_path.parent}: {e}", file=sys.stderr)


# --- Main Execution ---

def main():
    """Main function to orchestrate changelog generation and optional sidebar file"""
    parser = argparse.ArgumentParser(description="Generate changelog MDX files and optionally a sidebar definition")
    parser.add_argument(
        "--output-dir",
        metavar="PATH",
        type=Path,
        default=Path("mdx"), # Default changed to 'mdx'
        help="Root directory for generated MDX files (default: mdx)" # Help text updated
    )
    parser.add_argument(
        "--sidebar-file",
        metavar="PATH",
        type=Path,
        nargs='?', # Makes the argument optional
        const=Path('sidebar-changelog.ts'), # Value if flag is present without a value
        default=None, # Value if flag is not present at all
        help="Write TypeScript sidebar definition file (default path if PATH omitted: sidebar-changelog.ts)"
    )
    args = parser.parse_args()

    script_dir = Path(__file__).parent.resolve()
    # Resolve the output directory relative to the script directory
    output_dir = script_dir / args.output_dir
    # Resolve sidebar file path relative to script dir if it's relative and provided
    sidebar_file = None
    if args.sidebar_file:
        sidebar_file = script_dir / args.sidebar_file if not args.sidebar_file.is_absolute() else args.sidebar_file

    print(f"ℹ️ Generating changelogs into: {output_dir.relative_to(Path.cwd())}")

    all_products_sidebar_info: Dict[str, List[Tuple[str, str]]] = {}

    for product_name, config in PRODUCTS.items():
        src_path = config.get("path")
        product_title = config.get("title") or f"{product_name.replace('-', ' ').title()} Changelog"

        if not isinstance(src_path, Path):
             print(f"⚠️ Invalid 'path' configuration for product '{product_name}'; skipping", file=sys.stderr)
             continue
        if not isinstance(product_title, str):
             print(f"⚠️ Invalid 'title' configuration for product '{product_name}'; skipping", file=sys.stderr)
             continue

        versions_info = process_product(
            output_dir=output_dir, # Pass the configured output directory
            product_name=product_name,
            product_title=product_title,
            product_src_path=script_dir / src_path, # Resolve source path relative to script
            pr_base_url=config.get("pr_base_url")
        )

        if versions_info is not None:
            all_products_sidebar_info[product_name] = versions_info

    # Generate sidebar file if the argument was provided (path is not None) and data exists
    if sidebar_file and all_products_sidebar_info:
        generate_sidebar_file(all_products_sidebar_info, sidebar_file)
    elif sidebar_file: # Argument provided, but no data generated
        print(f"ℹ️ Sidebar file requested ({sidebar_file}), but no product data was successfully processed", file=sys.stderr)


if __name__ == "__main__":
    main()
