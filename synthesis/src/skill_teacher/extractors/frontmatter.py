"""Extract YAML frontmatter from markdown files."""

import re
from dataclasses import dataclass, field
from pathlib import Path

import yaml


@dataclass
class Frontmatter:
    """Parsed frontmatter from a documentation file."""

    title: str
    category: str | None = None
    example: str | None = None
    description: str | None = None
    raw: dict[str, str] = field(default_factory=dict)

    @property
    def first_sentence(self) -> str | None:
        """Get the first sentence of the description if available."""
        if self.description:
            # Split on period followed by space or end
            match = re.match(r"^([^.]+\.)", self.description)
            if match:
                return match.group(1).strip()
            return self.description.strip()
        return None


# Regex to match YAML frontmatter block
FRONTMATTER_PATTERN = re.compile(r"^---\s*\n(.*?)\n---\s*\n", re.DOTALL)


def extract_frontmatter(file_path: Path) -> Frontmatter | None:
    """
    Extract YAML frontmatter from a markdown file.

    Args:
        file_path: Path to the markdown file

    Returns:
        Frontmatter object if frontmatter exists, None otherwise
    """
    content = file_path.read_text(encoding="utf-8")
    match = FRONTMATTER_PATTERN.match(content)

    if not match:
        return None

    try:
        raw_data = yaml.safe_load(match.group(1))
        if not isinstance(raw_data, dict):
            return None

        # Extract known fields
        title = raw_data.get("title", file_path.stem)
        category = raw_data.get("category")
        example = raw_data.get("example")
        description = raw_data.get("description")

        return Frontmatter(
            title=title,
            category=category,
            example=example,
            description=description,
            raw=raw_data,
        )
    except yaml.YAMLError:
        return None


def extract_first_paragraph(file_path: Path) -> str | None:
    """
    Extract the first non-empty paragraph after frontmatter.

    This is typically a one-line summary of the doc.

    Args:
        file_path: Path to the markdown file

    Returns:
        First paragraph text, or None if not found
    """
    content = file_path.read_text(encoding="utf-8")

    # Remove frontmatter
    content = FRONTMATTER_PATTERN.sub("", content)

    # Remove import statements (for .mdx files)
    content = re.sub(r"^import\s+.*$", "", content, flags=re.MULTILINE)

    # Split into paragraphs and find first non-empty one
    paragraphs = content.split("\n\n")

    for para in paragraphs:
        para = para.strip()
        # Skip empty, headings, code blocks, and component tags
        if not para:
            continue
        if para.startswith("#"):
            continue
        if para.startswith("```"):
            continue
        if para.startswith("<"):
            continue
        if para.startswith(":::"):
            continue

        # Clean up the paragraph (remove markdown formatting)
        # Remove inline code backticks but keep content
        para = re.sub(r"`([^`]+)`", r"\1", para)
        # Remove links but keep text
        para = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", para)
        # Remove bold/italic
        para = re.sub(r"\*\*([^*]+)\*\*", r"\1", para)
        para = re.sub(r"\*([^*]+)\*", r"\1", para)

        # Return first sentence if paragraph is long
        if len(para) > 200:
            match = re.match(r"^([^.]+\.)", para)
            if match:
                return match.group(1).strip()

        return para.strip()

    return None
