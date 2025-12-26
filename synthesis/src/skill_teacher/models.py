"""Pydantic models for skill index schema."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class IndexMetadata(BaseModel):
    """Metadata for generated index files."""

    docs_root: str = "src/content/docs"
    generated: datetime = Field(default_factory=datetime.now)
    source_commit: str | None = None


class OperatorEntry(BaseModel):
    """Entry for a single operator in the index."""

    name: str
    path: str
    summary: str
    category: str | None = None
    example: str | None = None
    use_when: list[str] = Field(default_factory=list)
    related: list[str] = Field(default_factory=list)
    keywords: list[str] = Field(default_factory=list)


class OperatorCategory(BaseModel):
    """Category grouping for operators."""

    name: str
    description: str
    operators: list[OperatorEntry] = Field(default_factory=list)


class OperatorsIndex(BaseModel):
    """Complete operators index."""

    metadata: IndexMetadata = Field(default_factory=IndexMetadata)
    categories: list[OperatorCategory] = Field(default_factory=list)


class FunctionEntry(BaseModel):
    """Entry for a single function in the index."""

    name: str
    path: str
    summary: str
    category: str | None = None
    example: str | None = None
    use_when: list[str] = Field(default_factory=list)
    related: list[str] = Field(default_factory=list)
    keywords: list[str] = Field(default_factory=list)


class FunctionCategory(BaseModel):
    """Category grouping for functions."""

    name: str
    description: str
    functions: list[FunctionEntry] = Field(default_factory=list)


class FunctionsIndex(BaseModel):
    """Complete functions index."""

    metadata: IndexMetadata = Field(default_factory=IndexMetadata)
    categories: list[FunctionCategory] = Field(default_factory=list)


class GuideEntry(BaseModel):
    """Entry for a single guide in the index."""

    name: str
    path: str
    summary: str
    section: str | None = None
    use_when: list[str] = Field(default_factory=list)
    keywords: list[str] = Field(default_factory=list)


class GuideSection(BaseModel):
    """Section grouping for guides."""

    name: str
    description: str
    guides: list[GuideEntry] = Field(default_factory=list)


class GuidesIndex(BaseModel):
    """Complete guides index."""

    metadata: IndexMetadata = Field(default_factory=IndexMetadata)
    sections: list[GuideSection] = Field(default_factory=list)


class IntegrationEntry(BaseModel):
    """Entry for a single integration in the index."""

    name: str
    path: str
    summary: str
    vendor: str | None = None
    use_when: list[str] = Field(default_factory=list)
    keywords: list[str] = Field(default_factory=list)


class IntegrationVendor(BaseModel):
    """Vendor grouping for integrations."""

    name: str
    description: str
    integrations: list[IntegrationEntry] = Field(default_factory=list)


class IntegrationsIndex(BaseModel):
    """Complete integrations index."""

    metadata: IndexMetadata = Field(default_factory=IndexMetadata)
    vendors: list[IntegrationVendor] = Field(default_factory=list)


class ConceptEntry(BaseModel):
    """Entry for a single explanation/concept in the index."""

    name: str
    path: str
    summary: str
    topic: str | None = None
    use_when: list[str] = Field(default_factory=list)
    keywords: list[str] = Field(default_factory=list)


class ConceptTopic(BaseModel):
    """Topic grouping for explanations."""

    name: str
    description: str
    concepts: list[ConceptEntry] = Field(default_factory=list)


class ConceptsIndex(BaseModel):
    """Complete concepts/explanations index."""

    metadata: IndexMetadata = Field(default_factory=IndexMetadata)
    topics: list[ConceptTopic] = Field(default_factory=list)


class TutorialEntry(BaseModel):
    """Entry for a single tutorial in the index."""

    name: str
    path: str
    summary: str
    use_when: list[str] = Field(default_factory=list)
    keywords: list[str] = Field(default_factory=list)


class TutorialsIndex(BaseModel):
    """Complete tutorials index."""

    metadata: IndexMetadata = Field(default_factory=IndexMetadata)
    tutorials: list[TutorialEntry] = Field(default_factory=list)


# Type alias for all index types
IndexType = Literal[
    "operators", "functions", "guides", "integrations", "concepts", "tutorials"
]
