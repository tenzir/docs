"""Extract document structure and keywords from markdown files."""

import re
from dataclasses import dataclass, field
from pathlib import Path


@dataclass
class Heading:
    """A heading in the document."""

    level: int
    text: str
    line_number: int


@dataclass
class CodeBlock:
    """A code block in the document."""

    language: str | None
    content: str
    line_number: int


@dataclass
class DocStructure:
    """Extracted structure from a documentation file."""

    headings: list[Heading] = field(default_factory=list)
    code_blocks: list[CodeBlock] = field(default_factory=list)
    keywords: list[str] = field(default_factory=list)

    @property
    def tql_examples(self) -> list[str]:
        """Get all TQL code block contents."""
        return [cb.content for cb in self.code_blocks if cb.language == "tql"]

    @property
    def first_tql_example(self) -> str | None:
        """Get the first TQL example, if any."""
        examples = self.tql_examples
        return examples[0] if examples else None


# Patterns
HEADING_PATTERN = re.compile(r"^(#{1,6})\s+(.+)$", re.MULTILINE)
CODE_BLOCK_PATTERN = re.compile(r"^```(\w+)?\s*\n(.*?)^```", re.MULTILINE | re.DOTALL)
FRONTMATTER_PATTERN = re.compile(r"^---\s*\n.*?\n---\s*\n", re.DOTALL)


def extract_structure(file_path: Path) -> DocStructure:
    """
    Extract structure (headings, code blocks, keywords) from a markdown file.

    Args:
        file_path: Path to the markdown file

    Returns:
        DocStructure with extracted elements
    """
    content = file_path.read_text(encoding="utf-8")

    # Remove frontmatter for analysis
    content_no_fm = FRONTMATTER_PATTERN.sub("", content)

    # Extract headings
    headings: list[Heading] = []
    for match in HEADING_PATTERN.finditer(content_no_fm):
        level = len(match.group(1))
        text = match.group(2).strip()
        # Approximate line number
        line_num = content_no_fm[: match.start()].count("\n") + 1
        headings.append(Heading(level=level, text=text, line_number=line_num))

    # Extract code blocks
    code_blocks: list[CodeBlock] = []
    for match in CODE_BLOCK_PATTERN.finditer(content_no_fm):
        language = match.group(1)
        block_content = match.group(2).strip()
        line_num = content_no_fm[: match.start()].count("\n") + 1
        code_blocks.append(
            CodeBlock(language=language, content=block_content, line_number=line_num)
        )

    # Extract keywords from headings and content
    keywords = extract_keywords(content_no_fm, headings)

    return DocStructure(headings=headings, code_blocks=code_blocks, keywords=keywords)


def extract_keywords(content: str, headings: list[Heading]) -> list[str]:
    """
    Extract keywords from document content.

    Keywords are extracted from:
    - Heading text (cleaned of markdown)
    - Inline code identifiers
    - Meaningful words from content

    Args:
        content: Document content without frontmatter
        headings: Already extracted headings

    Returns:
        List of unique keywords, lowercase
    """
    keywords: set[str] = set()

    # Generic headings to skip
    generic_headings = {
        "description",
        "examples",
        "see also",
        "parameters",
        "options",
        "usage",
        "notes",
        "warning",
        "tip",
        "example",
    }

    # Add heading text as keywords (cleaned and split)
    for heading in headings:
        # Clean markdown from heading: remove backticks, links, etc.
        clean_heading = heading.text
        clean_heading = re.sub(r"`[^`]+`", "", clean_heading)  # Remove inline code
        clean_heading = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", clean_heading)  # Links
        clean_heading = re.sub(r"[^a-zA-Z0-9\s-]", " ", clean_heading)  # Keep alphanum

        # Skip generic headings
        if clean_heading.strip().lower() in generic_headings:
            continue

        # Add words from heading
        for word in clean_heading.lower().split():
            word = word.strip("-")
            if len(word) > 2 and word not in STOP_WORDS:
                keywords.add(word)

    # Extract inline code references (only clean identifiers)
    inline_code = re.findall(r"`([^`]+)`", content)
    for code in inline_code:
        code = code.strip()
        # Skip long code snippets, paths, URLs, and complex expressions
        if len(code) > 25:
            continue
        if "/" in code or "://" in code or "=" in code:
            continue
        if "(" in code or "{" in code or "[" in code:
            continue
        # Only add if it's a clean identifier (letters, numbers, underscores)
        if re.match(r"^[a-z][a-z0-9_]*$", code, re.IGNORECASE):
            keywords.add(code.lower())

    # Extract key action words from content (verbs that indicate functionality)
    action_patterns = [
        r"\b(filter|select|transform|convert|parse|load|save|read|write)\b",
        r"\b(aggregate|summarize|group|sort|join|merge|split)\b",
        r"\b(encode|decode|compress|decompress|encrypt|decrypt)\b",
        r"\b(connect|subscribe|publish|send|receive|stream)\b",
        r"\b(import|export|ingest|extract|enrich)\b",
    ]
    for pattern in action_patterns:
        for match in re.finditer(pattern, content, re.IGNORECASE):
            word = match.group(1).lower()
            if word not in STOP_WORDS:
                keywords.add(word)

    # Final filter: remove any stop words that slipped through
    keywords = {k for k in keywords if k not in STOP_WORDS}

    return sorted(keywords)


# Common stop words to filter out
STOP_WORDS = {
    # Articles and conjunctions
    "the", "a", "an", "and", "or", "but", "nor", "yet",
    # Prepositions
    "in", "on", "at", "to", "for", "of", "with", "by", "from", "as", "into",
    "about", "above", "after", "before", "between", "under", "over",
    # Pronouns
    "it", "its", "you", "your", "we", "our", "they", "their", "he", "she",
    "him", "her", "his", "them", "who", "which", "what",
    # Demonstratives
    "this", "that", "these", "those",
    # Verbs (common)
    "is", "was", "are", "were", "been", "be", "being",
    "have", "has", "had", "having",
    "do", "does", "did", "doing",
    "will", "would", "could", "should", "may", "might", "must", "shall", "can",
    "use", "using", "used", "uses",
    "see", "also", "note", "example",
    # Adverbs
    "if", "then", "else", "when", "where", "why", "how",
    "all", "each", "every", "both", "few", "more", "most", "other", "some",
    "such", "no", "not", "only", "same", "so", "than", "too", "very", "just",
    "also", "here", "there", "now", "new", "first", "last", "next",
    # Common doc words
    "following", "below", "above", "default", "optional", "required",
    "argument", "arguments", "parameter", "parameters", "value", "values",
    "input", "output", "result", "results", "return", "returns",
}
