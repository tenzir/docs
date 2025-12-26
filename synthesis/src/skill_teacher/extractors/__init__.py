"""Extractors for parsing documentation files."""

from skill_teacher.extractors.frontmatter import (
    extract_frontmatter,
    extract_first_paragraph,
    Frontmatter,
)
from skill_teacher.extractors.structure import extract_structure, DocStructure

__all__ = [
    "extract_frontmatter",
    "extract_first_paragraph",
    "Frontmatter",
    "extract_structure",
    "DocStructure",
]
