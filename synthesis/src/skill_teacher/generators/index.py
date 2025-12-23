"""Generate YAML index files from documentation."""

import subprocess
from datetime import datetime, timezone
from pathlib import Path

import yaml
from rich.console import Console

from skill_teacher.extractors import (
    extract_frontmatter,
    extract_first_paragraph,
    extract_structure,
)
from skill_teacher.models import (
    IndexMetadata,
    OperatorEntry,
    OperatorCategory,
    OperatorsIndex,
    FunctionEntry,
    FunctionCategory,
    FunctionsIndex,
    GuideEntry,
    GuideSection,
    GuidesIndex,
    IntegrationEntry,
    IntegrationVendor,
    IntegrationsIndex,
    ConceptEntry,
    ConceptTopic,
    ConceptsIndex,
    TutorialEntry,
    TutorialsIndex,
)

console = Console()


def get_git_commit() -> str | None:
    """Get the current git commit hash."""
    try:
        result = subprocess.run(
            ["git", "rev-parse", "--short", "HEAD"],
            capture_output=True,
            text=True,
            check=True,
        )
        return result.stdout.strip()
    except (subprocess.CalledProcessError, FileNotFoundError):
        return None


def create_metadata() -> IndexMetadata:
    """Create metadata for index files."""
    return IndexMetadata(
        docs_root="src/content/docs",
        generated=datetime.now(timezone.utc),
        source_commit=get_git_commit(),
    )


def generate_all_indexes(docs_path: Path, output_path: Path) -> None:
    """
    Generate all index files from documentation.

    Args:
        docs_path: Path to src/content/docs
        output_path: Path to output directory for index files
    """
    output_path.mkdir(parents=True, exist_ok=True)

    # Generate each index type
    generate_operators_index(docs_path, output_path)
    generate_functions_index(docs_path, output_path)
    generate_guides_index(docs_path, output_path)
    generate_integrations_index(docs_path, output_path)
    generate_concepts_index(docs_path, output_path)
    generate_tutorials_index(docs_path, output_path)


def write_yaml(data: dict, output_file: Path) -> None:
    """Write data to a YAML file with nice formatting."""
    # Custom representer for datetime
    def datetime_representer(dumper: yaml.Dumper, data: datetime) -> yaml.Node:
        return dumper.represent_scalar("tag:yaml.org,2002:timestamp", data.isoformat())

    yaml.add_representer(datetime, datetime_representer)

    with output_file.open("w", encoding="utf-8") as f:
        yaml.dump(
            data,
            f,
            default_flow_style=False,
            allow_unicode=True,
            sort_keys=False,
            width=100,
        )


# --- Operators Index ---


def generate_operators_index(docs_path: Path, output_path: Path) -> None:
    """Generate operators.yaml from reference/operators/."""
    console.print("[blue]Generating operators index...[/]")

    operators_path = docs_path / "reference" / "operators"
    if not operators_path.exists():
        console.print(f"[yellow]Warning: {operators_path} not found[/]")
        return

    # Collect all operator files
    operator_files = list(operators_path.glob("*.md")) + list(
        operators_path.glob("*.mdx")
    )
    # Also check subdirectories
    for subdir in operators_path.iterdir():
        if subdir.is_dir():
            operator_files.extend(subdir.glob("*.md"))
            operator_files.extend(subdir.glob("*.mdx"))

    console.print(f"  Found {len(operator_files)} operator files")

    # Group operators by category
    categories: dict[str, list[OperatorEntry]] = {}

    for file_path in sorted(operator_files):
        entry = create_operator_entry(file_path, docs_path)
        if entry:
            cat = entry.category or "Uncategorized"
            if cat not in categories:
                categories[cat] = []
            categories[cat].append(entry)

    # Build index
    index = OperatorsIndex(
        metadata=create_metadata(),
        categories=[
            OperatorCategory(
                name=cat_name,
                description=get_category_description(cat_name),
                operators=sorted(ops, key=lambda x: x.name),
            )
            for cat_name, ops in sorted(categories.items())
        ],
    )

    # Write to file
    output_file = output_path / "operators.yaml"
    write_yaml(index.model_dump(mode="json"), output_file)
    console.print(f"  [green]Wrote {output_file}[/]")


def create_operator_entry(file_path: Path, docs_root: Path) -> OperatorEntry | None:
    """Create an OperatorEntry from a file."""
    frontmatter = extract_frontmatter(file_path)
    if not frontmatter:
        return None

    # Get relative path from docs root
    rel_path = file_path.relative_to(docs_root)

    # Extract first paragraph as summary
    summary = extract_first_paragraph(file_path) or f"The {frontmatter.title} operator"

    # Extract structure for keywords
    structure = extract_structure(file_path)

    return OperatorEntry(
        name=frontmatter.title,
        path=str(rel_path),
        summary=summary[:200] if len(summary) > 200 else summary,
        category=frontmatter.category,
        example=frontmatter.example,
        use_when=generate_use_when(frontmatter, summary),
        related=[],  # TODO: extract from See Also section
        keywords=structure.keywords[:15],  # Limit keywords
    )


# --- Functions Index ---


def generate_functions_index(docs_path: Path, output_path: Path) -> None:
    """Generate functions.yaml from reference/functions/."""
    console.print("[blue]Generating functions index...[/]")

    functions_path = docs_path / "reference" / "functions"
    if not functions_path.exists():
        console.print(f"[yellow]Warning: {functions_path} not found[/]")
        return

    # Collect all function files
    function_files = list(functions_path.glob("*.md")) + list(
        functions_path.glob("*.mdx")
    )
    # Also check subdirectories
    for subdir in functions_path.iterdir():
        if subdir.is_dir():
            function_files.extend(subdir.glob("*.md"))
            function_files.extend(subdir.glob("*.mdx"))

    console.print(f"  Found {len(function_files)} function files")

    # Group functions by category
    categories: dict[str, list[FunctionEntry]] = {}

    for file_path in sorted(function_files):
        entry = create_function_entry(file_path, docs_path)
        if entry:
            cat = entry.category or "Uncategorized"
            if cat not in categories:
                categories[cat] = []
            categories[cat].append(entry)

    # Build index
    index = FunctionsIndex(
        metadata=create_metadata(),
        categories=[
            FunctionCategory(
                name=cat_name,
                description=get_category_description(cat_name),
                functions=sorted(funcs, key=lambda x: x.name),
            )
            for cat_name, funcs in sorted(categories.items())
        ],
    )

    # Write to file
    output_file = output_path / "functions.yaml"
    write_yaml(index.model_dump(mode="json"), output_file)
    console.print(f"  [green]Wrote {output_file}[/]")


def create_function_entry(file_path: Path, docs_root: Path) -> FunctionEntry | None:
    """Create a FunctionEntry from a file."""
    frontmatter = extract_frontmatter(file_path)
    if not frontmatter:
        return None

    rel_path = file_path.relative_to(docs_root)
    summary = extract_first_paragraph(file_path) or f"The {frontmatter.title} function"
    structure = extract_structure(file_path)

    return FunctionEntry(
        name=frontmatter.title,
        path=str(rel_path),
        summary=summary[:200] if len(summary) > 200 else summary,
        category=frontmatter.category,
        example=frontmatter.example,
        use_when=generate_use_when(frontmatter, summary),
        related=[],
        keywords=structure.keywords[:15],
    )


# --- Guides Index ---


def generate_guides_index(docs_path: Path, output_path: Path) -> None:
    """Generate guides.yaml from guides/."""
    console.print("[blue]Generating guides index...[/]")

    guides_path = docs_path / "guides"
    if not guides_path.exists():
        console.print(f"[yellow]Warning: {guides_path} not found[/]")
        return

    # Find all guide files, grouped by section (subdirectory)
    sections: dict[str, list[GuideEntry]] = {}

    for item in guides_path.iterdir():
        if item.is_file() and item.suffix in {".md", ".mdx"}:
            # Top-level guide
            entry = create_guide_entry(item, docs_path, "General")
            if entry:
                if "General" not in sections:
                    sections["General"] = []
                sections["General"].append(entry)
        elif item.is_dir():
            # Section directory
            section_name = item.name.replace("-", " ").title()
            for guide_file in item.rglob("*.md"):
                entry = create_guide_entry(guide_file, docs_path, section_name)
                if entry:
                    if section_name not in sections:
                        sections[section_name] = []
                    sections[section_name].append(entry)
            for guide_file in item.rglob("*.mdx"):
                entry = create_guide_entry(guide_file, docs_path, section_name)
                if entry:
                    if section_name not in sections:
                        sections[section_name] = []
                    sections[section_name].append(entry)

    total_guides = sum(len(g) for g in sections.values())
    console.print(f"  Found {total_guides} guides in {len(sections)} sections")

    # Build index
    index = GuidesIndex(
        metadata=create_metadata(),
        sections=[
            GuideSection(
                name=section_name,
                description=get_section_description(section_name),
                guides=sorted(guides, key=lambda x: x.name),
            )
            for section_name, guides in sorted(sections.items())
        ],
    )

    output_file = output_path / "guides.yaml"
    write_yaml(index.model_dump(mode="json"), output_file)
    console.print(f"  [green]Wrote {output_file}[/]")


def create_guide_entry(
    file_path: Path, docs_root: Path, section: str
) -> GuideEntry | None:
    """Create a GuideEntry from a file."""
    frontmatter = extract_frontmatter(file_path)
    if not frontmatter:
        return None

    rel_path = file_path.relative_to(docs_root)
    summary = extract_first_paragraph(file_path) or frontmatter.title
    structure = extract_structure(file_path)

    return GuideEntry(
        name=frontmatter.title,
        path=str(rel_path),
        summary=summary[:200] if len(summary) > 200 else summary,
        section=section,
        use_when=generate_use_when(frontmatter, summary),
        keywords=structure.keywords[:15],
    )


# --- Integrations Index ---


def generate_integrations_index(docs_path: Path, output_path: Path) -> None:
    """Generate integrations.yaml from integrations/."""
    console.print("[blue]Generating integrations index...[/]")

    integrations_path = docs_path / "integrations"
    if not integrations_path.exists():
        console.print(f"[yellow]Warning: {integrations_path} not found[/]")
        return

    # Group by vendor (subdirectory)
    vendors: dict[str, list[IntegrationEntry]] = {}

    for item in integrations_path.iterdir():
        if item.is_file() and item.suffix in {".md", ".mdx"}:
            # Top-level integration
            entry = create_integration_entry(item, docs_path, "Other")
            if entry:
                if "Other" not in vendors:
                    vendors["Other"] = []
                vendors["Other"].append(entry)
        elif item.is_dir():
            # Vendor directory
            vendor_name = item.name.replace("-", " ").title()
            for int_file in item.rglob("*.md"):
                entry = create_integration_entry(int_file, docs_path, vendor_name)
                if entry:
                    if vendor_name not in vendors:
                        vendors[vendor_name] = []
                    vendors[vendor_name].append(entry)
            for int_file in item.rglob("*.mdx"):
                entry = create_integration_entry(int_file, docs_path, vendor_name)
                if entry:
                    if vendor_name not in vendors:
                        vendors[vendor_name] = []
                    vendors[vendor_name].append(entry)

    total_integrations = sum(len(i) for i in vendors.values())
    console.print(
        f"  Found {total_integrations} integrations in {len(vendors)} vendors"
    )

    # Build index
    index = IntegrationsIndex(
        metadata=create_metadata(),
        vendors=[
            IntegrationVendor(
                name=vendor_name,
                description=get_vendor_description(vendor_name),
                integrations=sorted(ints, key=lambda x: x.name),
            )
            for vendor_name, ints in sorted(vendors.items())
        ],
    )

    output_file = output_path / "integrations.yaml"
    write_yaml(index.model_dump(mode="json"), output_file)
    console.print(f"  [green]Wrote {output_file}[/]")


def create_integration_entry(
    file_path: Path, docs_root: Path, vendor: str
) -> IntegrationEntry | None:
    """Create an IntegrationEntry from a file."""
    frontmatter = extract_frontmatter(file_path)
    if not frontmatter:
        return None

    rel_path = file_path.relative_to(docs_root)
    summary = extract_first_paragraph(file_path) or frontmatter.title
    structure = extract_structure(file_path)

    return IntegrationEntry(
        name=frontmatter.title,
        path=str(rel_path),
        summary=summary[:200] if len(summary) > 200 else summary,
        vendor=vendor,
        use_when=generate_use_when(frontmatter, summary),
        keywords=structure.keywords[:15],
    )


# --- Concepts Index ---


def generate_concepts_index(docs_path: Path, output_path: Path) -> None:
    """Generate concepts.yaml from explanations/."""
    console.print("[blue]Generating concepts index...[/]")

    explanations_path = docs_path / "explanations"
    if not explanations_path.exists():
        console.print(f"[yellow]Warning: {explanations_path} not found[/]")
        return

    # Group by topic (subdirectory)
    topics: dict[str, list[ConceptEntry]] = {}

    for item in explanations_path.iterdir():
        if item.is_file() and item.suffix in {".md", ".mdx"}:
            entry = create_concept_entry(item, docs_path, "General")
            if entry:
                if "General" not in topics:
                    topics["General"] = []
                topics["General"].append(entry)
        elif item.is_dir():
            topic_name = item.name.replace("-", " ").title()
            for concept_file in item.rglob("*.md"):
                entry = create_concept_entry(concept_file, docs_path, topic_name)
                if entry:
                    if topic_name not in topics:
                        topics[topic_name] = []
                    topics[topic_name].append(entry)
            for concept_file in item.rglob("*.mdx"):
                entry = create_concept_entry(concept_file, docs_path, topic_name)
                if entry:
                    if topic_name not in topics:
                        topics[topic_name] = []
                    topics[topic_name].append(entry)

    total_concepts = sum(len(c) for c in topics.values())
    console.print(f"  Found {total_concepts} concepts in {len(topics)} topics")

    # Build index
    index = ConceptsIndex(
        metadata=create_metadata(),
        topics=[
            ConceptTopic(
                name=topic_name,
                description=get_topic_description(topic_name),
                concepts=sorted(concepts, key=lambda x: x.name),
            )
            for topic_name, concepts in sorted(topics.items())
        ],
    )

    output_file = output_path / "concepts.yaml"
    write_yaml(index.model_dump(mode="json"), output_file)
    console.print(f"  [green]Wrote {output_file}[/]")


def create_concept_entry(
    file_path: Path, docs_root: Path, topic: str
) -> ConceptEntry | None:
    """Create a ConceptEntry from a file."""
    frontmatter = extract_frontmatter(file_path)
    if not frontmatter:
        return None

    rel_path = file_path.relative_to(docs_root)
    summary = extract_first_paragraph(file_path) or frontmatter.title
    structure = extract_structure(file_path)

    return ConceptEntry(
        name=frontmatter.title,
        path=str(rel_path),
        summary=summary[:200] if len(summary) > 200 else summary,
        topic=topic,
        use_when=generate_use_when(frontmatter, summary),
        keywords=structure.keywords[:15],
    )


# --- Tutorials Index ---


def generate_tutorials_index(docs_path: Path, output_path: Path) -> None:
    """Generate tutorials.yaml from tutorials/."""
    console.print("[blue]Generating tutorials index...[/]")

    tutorials_path = docs_path / "tutorials"
    if not tutorials_path.exists():
        console.print(f"[yellow]Warning: {tutorials_path} not found[/]")
        return

    tutorials: list[TutorialEntry] = []

    # Collect all tutorial files
    for tutorial_file in tutorials_path.rglob("*.md"):
        entry = create_tutorial_entry(tutorial_file, docs_path)
        if entry:
            tutorials.append(entry)
    for tutorial_file in tutorials_path.rglob("*.mdx"):
        entry = create_tutorial_entry(tutorial_file, docs_path)
        if entry:
            tutorials.append(entry)

    console.print(f"  Found {len(tutorials)} tutorials")

    # Build index
    index = TutorialsIndex(
        metadata=create_metadata(),
        tutorials=sorted(tutorials, key=lambda x: x.name),
    )

    output_file = output_path / "tutorials.yaml"
    write_yaml(index.model_dump(mode="json"), output_file)
    console.print(f"  [green]Wrote {output_file}[/]")


def create_tutorial_entry(file_path: Path, docs_root: Path) -> TutorialEntry | None:
    """Create a TutorialEntry from a file."""
    frontmatter = extract_frontmatter(file_path)
    if not frontmatter:
        return None

    rel_path = file_path.relative_to(docs_root)
    summary = extract_first_paragraph(file_path) or frontmatter.title
    structure = extract_structure(file_path)

    return TutorialEntry(
        name=frontmatter.title,
        path=str(rel_path),
        summary=summary[:200] if len(summary) > 200 else summary,
        use_when=generate_use_when(frontmatter, summary),
        keywords=structure.keywords[:15],
    )


# --- Helper Functions ---


def generate_use_when(frontmatter: "Frontmatter", summary: str) -> list[str]:
    """Generate use_when suggestions based on content."""
    use_when: list[str] = []
    summary_lower = summary.lower()
    title_lower = frontmatter.title.lower()

    # Category-based triggers
    if frontmatter.category:
        cat_lower = frontmatter.category.lower()
        category_triggers = {
            "input": "loading or ingesting data",
            "source": "loading or ingesting data",
            "output": "exporting or saving data",
            "sink": "exporting or saving data",
            "transform": "transforming or reshaping data",
            "modify": "modifying event fields",
            "filter": "filtering or selecting events",
            "aggregat": "aggregating or summarizing data",
            "analyze": "analyzing data patterns",
            "math": "performing calculations",
            "string": "manipulating text",
            "time": "working with timestamps",
            "date": "working with dates",
            "chart": "visualizing data",
            "pars": "parsing data formats",
            "print": "outputting formatted data",
            "encod": "encoding data",
            "decod": "decoding data",
            "context": "using lookup tables or enrichment",
            "ocsf": "mapping to OCSF schema",
            "connect": "connecting pipelines",
            "flow": "controlling pipeline flow",
            "inspect": "inspecting node state",
            "storage": "managing stored data",
            "package": "managing packages",
            "pipeline": "managing pipelines",
            "escape": "running external code",
            "detection": "running detection rules",
            "host": "querying host information",
            "internal": "controlling pipeline behavior",
        }
        for key, trigger in category_triggers.items():
            if key in cat_lower and trigger not in use_when:
                use_when.append(trigger)
                break

    # Summary-based triggers (pattern matching)
    summary_triggers = [
        (r"convert|transform", "converting between formats"),
        (r"pars(e|ing)", "parsing structured data"),
        (r"filter|select|where", "filtering events"),
        (r"sort|order", "sorting events"),
        (r"group|aggregat|summar", "aggregating data"),
        (r"join|merge|combine", "joining data sources"),
        (r"enrich|lookup|context", "enriching with external data"),
        (r"compress|decompress", "compressing data"),
        (r"encrypt|decrypt", "encrypting data"),
        (r"load|read|ingest|import", "loading data"),
        (r"save|write|export|send", "saving data"),
        (r"kafka|amqp|sqs", "messaging systems"),
        (r"s3|blob|gcs|storage", "cloud storage"),
        (r"http|api|rest", "HTTP/API operations"),
        (r"json|csv|yaml|xml", "working with structured formats"),
        (r"syslog|cef|leef", "parsing log formats"),
        (r"ip|network|dns", "network data"),
        (r"sigma|yara", "running detection rules"),
    ]
    import re

    for pattern, trigger in summary_triggers:
        if re.search(pattern, summary_lower) and trigger not in use_when:
            use_when.append(trigger)
            if len(use_when) >= 3:
                break

    # Name-based triggers for common operators
    name_triggers = {
        "from": "loading data from sources",
        "to": "sending data to destinations",
        "where": "filtering events by condition",
        "select": "choosing specific fields",
        "drop": "removing fields",
        "summarize": "aggregating events",
        "sort": "ordering events",
        "head": "limiting to first N events",
        "tail": "getting last N events",
        "deduplicate": "removing duplicate events",
        "flatten": "flattening nested structures",
        "unflatten": "creating nested structures",
    }
    if title_lower in name_triggers and name_triggers[title_lower] not in use_when:
        use_when.insert(0, name_triggers[title_lower])

    return use_when[:3]  # Limit to 3


def get_category_description(category: str) -> str:
    """Get a description for an operator/function category."""
    descriptions = {
        "Inputs/Events": "Operators that produce events from data sources",
        "Outputs/Events": "Operators that write events to destinations",
        "Transformations": "Operators that modify event structure or content",
        "Filters": "Operators that select or filter events",
        "Aggregations": "Operators that aggregate or summarize events",
        "Math": "Mathematical functions and operations",
        "String": "String manipulation functions",
        "Time": "Date, time, and duration functions",
        "Uncategorized": "Other operators and functions",
    }
    return descriptions.get(category, f"{category} operators and functions")


def get_section_description(section: str) -> str:
    """Get a description for a guide section."""
    descriptions = {
        "General": "General guides and quickstart",
        "Node Setup": "Setting up and configuring Tenzir nodes",
        "Platform Setup": "Deploying and managing the Tenzir platform",
        "Data Shaping": "Transforming and manipulating data with TQL",
        "Data Loading": "Loading data from various sources",
        "Enrichment": "Enriching events with context and lookups",
        "Edge Storage": "Working with local node storage",
        "Ai Workbench": "Using AI tools with Tenzir",
        "Testing": "Writing and running tests",
        "Package Management": "Managing Tenzir packages",
        "Contribution": "Contributing to Tenzir",
        "Development": "Development and build guides",
    }
    return descriptions.get(section, f"Guides for {section.lower()}")


def get_vendor_description(vendor: str) -> str:
    """Get a description for an integration vendor."""
    descriptions = {
        "Amazon": "AWS services including S3, SQS, MSK, and Security Lake",
        "Microsoft": "Azure and Microsoft services",
        "Google": "Google Cloud Platform services",
        "Other": "Other integrations and protocols",
    }
    return descriptions.get(vendor, f"Integrations with {vendor}")


def get_topic_description(topic: str) -> str:
    """Get a description for an explanation topic."""
    descriptions = {
        "General": "General concepts and FAQ",
        "Architecture": "Tenzir architecture: pipelines, nodes, and platform",
        "Language": "TQL language: types, expressions, statements, programs",
    }
    return descriptions.get(topic, f"Explanations about {topic.lower()}")
