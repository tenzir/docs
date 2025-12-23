"""Validate generated skill content."""

from pathlib import Path

import yaml


def validate_skill(skill_path: Path, docs_root: Path | None = None) -> list[str]:
    """
    Validate a generated skill directory.

    Args:
        skill_path: Path to the skill directory
        docs_root: Optional path to docs root for path validation

    Returns:
        List of error messages (empty if valid)
    """
    errors: list[str] = []

    # Check SKILL.md exists
    skill_md = skill_path / "SKILL.md"
    if not skill_md.exists():
        errors.append(f"Missing SKILL.md at {skill_path}")

    # Check index directory
    index_path = skill_path / "index"
    if index_path.exists():
        # Validate each YAML file
        for yaml_file in index_path.glob("*.yaml"):
            file_errors = validate_yaml_file(yaml_file, docs_root)
            errors.extend(file_errors)
    else:
        errors.append(f"Missing index directory at {skill_path}")

    # Check summaries directory
    summaries_path = skill_path / "summaries"
    if summaries_path.exists():
        summary_errors = validate_summaries(summaries_path)
        errors.extend(summary_errors)

    return errors


def validate_summaries(summaries_path: Path) -> list[str]:
    """
    Validate summary files.

    Args:
        summaries_path: Path to summaries directory

    Returns:
        List of error messages
    """
    errors: list[str] = []
    expected = ["architecture.md", "tql-language.md", "common-patterns.md"]

    for name in expected:
        summary_file = summaries_path / name
        if not summary_file.exists():
            errors.append(f"Missing summary: {name}")
        else:
            content = summary_file.read_text()
            if len(content) < 100:
                errors.append(f"Summary too short: {name}")
            if "# " not in content:
                errors.append(f"Summary missing heading: {name}")

    return errors


def validate_yaml_file(yaml_path: Path, docs_root: Path | None = None) -> list[str]:
    """
    Validate a YAML index file.

    Args:
        yaml_path: Path to the YAML file
        docs_root: Optional path to docs root for path validation

    Returns:
        List of error messages
    """
    errors: list[str] = []

    try:
        with yaml_path.open(encoding="utf-8") as f:
            data = yaml.safe_load(f)

        if not isinstance(data, dict):
            errors.append(f"{yaml_path.name}: Root must be a dictionary")
            return errors

        # Check metadata
        if "metadata" not in data:
            errors.append(f"{yaml_path.name}: Missing 'metadata' field")
        else:
            metadata = data["metadata"]
            if not isinstance(metadata, dict):
                errors.append(f"{yaml_path.name}: 'metadata' must be a dictionary")
            elif "docs_root" not in metadata:
                errors.append(f"{yaml_path.name}: Missing 'metadata.docs_root'")

        # Check for at least some content
        content_keys = {"categories", "sections", "vendors", "topics", "tutorials"}
        has_content = any(key in data for key in content_keys)
        if not has_content:
            errors.append(
                f"{yaml_path.name}: Missing content "
                f"(expected one of {content_keys})"
            )

        # Validate paths if docs_root provided
        if docs_root and has_content:
            paths = _extract_paths(data)
            for path in paths:
                full_path = docs_root / path
                if not full_path.exists():
                    errors.append(f"{yaml_path.name}: Path not found: {path}")

    except yaml.YAMLError as e:
        errors.append(f"{yaml_path.name}: Invalid YAML - {e}")
    except Exception as e:
        errors.append(f"{yaml_path.name}: Error reading file - {e}")

    return errors


def _extract_paths(data: dict) -> list[str]:
    """Extract all paths from an index."""
    paths = []
    if "categories" in data:
        for cat in data["categories"]:
            key = "operators" if "operators" in cat else "functions"
            for entry in cat.get(key, []):
                if "path" in entry:
                    paths.append(entry["path"])
    elif "sections" in data:
        for section in data["sections"]:
            for entry in section.get("guides", []):
                if "path" in entry:
                    paths.append(entry["path"])
    elif "vendors" in data:
        for vendor in data["vendors"]:
            for entry in vendor.get("integrations", []):
                if "path" in entry:
                    paths.append(entry["path"])
    elif "topics" in data:
        for topic in data["topics"]:
            for entry in topic.get("concepts", []):
                if "path" in entry:
                    paths.append(entry["path"])
    elif "tutorials" in data:
        for entry in data["tutorials"]:
            if "path" in entry:
                paths.append(entry["path"])
    return paths
