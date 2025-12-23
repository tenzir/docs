"""Validate generated skill content."""

from pathlib import Path

import yaml


def validate_skill(skill_path: Path) -> list[str]:
    """
    Validate a generated skill directory.

    Args:
        skill_path: Path to the skill directory

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
            file_errors = validate_yaml_file(yaml_file)
            errors.extend(file_errors)
    else:
        errors.append(f"Missing index directory at {skill_path}")

    return errors


def validate_yaml_file(yaml_path: Path) -> list[str]:
    """
    Validate a YAML index file.

    Args:
        yaml_path: Path to the YAML file

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

    except yaml.YAMLError as e:
        errors.append(f"{yaml_path.name}: Invalid YAML - {e}")
    except Exception as e:
        errors.append(f"{yaml_path.name}: Error reading file - {e}")

    return errors
