"""Tests for skill-teacher generators."""

from pathlib import Path

import pytest
import yaml


@pytest.fixture
def docs_root() -> Path:
    """Get the docs root path."""
    # Find repo root by looking for src/content/docs
    cwd = Path.cwd()
    for parent in [cwd, *cwd.parents]:
        if (parent / "src" / "content" / "docs").is_dir():
            return parent / "src" / "content" / "docs"
    pytest.skip("Could not find docs root")


@pytest.fixture
def index_dir() -> Path:
    """Get the index directory path."""
    cwd = Path.cwd()
    for parent in [cwd, *cwd.parents]:
        index_path = (
            parent
            / ".claude"
            / "plugins"
            / "knowledge"
            / "skills"
            / "navigating-docs"
            / "index"
        )
        if index_path.is_dir():
            return index_path
    pytest.skip("Index directory not found - run generate-index first")


class TestYamlValidity:
    """Test that all YAML files are valid."""

    def test_all_yaml_files_parse(self, index_dir: Path) -> None:
        """All YAML files should parse without errors."""
        for yaml_file in index_dir.glob("*.yaml"):
            with yaml_file.open() as f:
                data = yaml.safe_load(f)
            assert isinstance(data, dict), f"{yaml_file.name} root should be dict"
            assert "metadata" in data, f"{yaml_file.name} should have metadata"

    def test_metadata_has_required_fields(self, index_dir: Path) -> None:
        """Metadata should have docs_root and generated fields."""
        for yaml_file in index_dir.glob("*.yaml"):
            with yaml_file.open() as f:
                data = yaml.safe_load(f)
            metadata = data["metadata"]
            assert "docs_root" in metadata
            assert "generated" in metadata


class TestPathValidity:
    """Test that all paths in indexes point to existing files."""

    def _get_all_paths(self, data: dict) -> list[str]:
        """Extract all paths from an index."""
        paths = []
        if "categories" in data:
            for cat in data["categories"]:
                key = "operators" if "operators" in cat else "functions"
                for entry in cat.get(key, []):
                    paths.append(entry["path"])
        elif "sections" in data:
            for section in data["sections"]:
                for entry in section.get("guides", []):
                    paths.append(entry["path"])
        elif "vendors" in data:
            for vendor in data["vendors"]:
                for entry in vendor.get("integrations", []):
                    paths.append(entry["path"])
        elif "topics" in data:
            for topic in data["topics"]:
                for entry in topic.get("concepts", []):
                    paths.append(entry["path"])
        elif "tutorials" in data:
            for entry in data["tutorials"]:
                paths.append(entry["path"])
        return paths

    def test_all_paths_exist(self, index_dir: Path, docs_root: Path) -> None:
        """All paths in indexes should point to existing files."""
        for yaml_file in index_dir.glob("*.yaml"):
            with yaml_file.open() as f:
                data = yaml.safe_load(f)
            paths = self._get_all_paths(data)
            for path in paths:
                full_path = docs_root / path
                assert full_path.exists(), f"{yaml_file.name}: {path} does not exist"


class TestEntryContent:
    """Test that index entries have valid content."""

    def test_operators_have_required_fields(self, index_dir: Path) -> None:
        """Operator entries should have name, path, and summary."""
        yaml_file = index_dir / "operators.yaml"
        if not yaml_file.exists():
            pytest.skip("operators.yaml not found")

        with yaml_file.open() as f:
            data = yaml.safe_load(f)

        for cat in data["categories"]:
            for op in cat["operators"]:
                assert "name" in op, f"Operator missing name"
                assert "path" in op, f"Operator {op.get('name')} missing path"
                assert "summary" in op, f"Operator {op.get('name')} missing summary"

    def test_functions_have_required_fields(self, index_dir: Path) -> None:
        """Function entries should have name, path, and summary."""
        yaml_file = index_dir / "functions.yaml"
        if not yaml_file.exists():
            pytest.skip("functions.yaml not found")

        with yaml_file.open() as f:
            data = yaml.safe_load(f)

        for cat in data["categories"]:
            for func in cat["functions"]:
                assert "name" in func, f"Function missing name"
                assert "path" in func, f"Function {func.get('name')} missing path"
                assert "summary" in func, f"Function {func.get('name')} missing summary"


class TestSummaries:
    """Test that summary files are valid."""

    @pytest.fixture
    def summaries_dir(self) -> Path:
        """Get the summaries directory path."""
        cwd = Path.cwd()
        for parent in [cwd, *cwd.parents]:
            summaries_path = (
                parent
                / ".claude"
                / "plugins"
                / "knowledge"
                / "skills"
                / "navigating-docs"
                / "summaries"
            )
            if summaries_path.is_dir():
                return summaries_path
        pytest.skip("Summaries directory not found")

    def test_all_summaries_exist(self, summaries_dir: Path) -> None:
        """All expected summary files should exist."""
        expected = ["architecture.md", "tql-language.md", "common-patterns.md"]
        for name in expected:
            assert (summaries_dir / name).exists(), f"{name} should exist"

    def test_summaries_are_not_empty(self, summaries_dir: Path) -> None:
        """Summary files should have content."""
        for md_file in summaries_dir.glob("*.md"):
            content = md_file.read_text()
            assert len(content) > 100, f"{md_file.name} should have substantial content"

    def test_summaries_have_headings(self, summaries_dir: Path) -> None:
        """Summary files should have markdown headings."""
        for md_file in summaries_dir.glob("*.md"):
            content = md_file.read_text()
            assert "# " in content, f"{md_file.name} should have a heading"


class TestPluginStructure:
    """Test that the plugin structure is correct."""

    def test_plugin_json_exists(self) -> None:
        """plugin.json should exist in .claude-plugin directory."""
        cwd = Path.cwd()
        for parent in [cwd, *cwd.parents]:
            plugin_json = (
                parent
                / ".claude"
                / "plugins"
                / "knowledge"
                / ".claude-plugin"
                / "plugin.json"
            )
            if plugin_json.exists():
                return
        pytest.fail("plugin.json not found")

    def test_skill_md_exists(self) -> None:
        """SKILL.md should exist in the skill directory."""
        cwd = Path.cwd()
        for parent in [cwd, *cwd.parents]:
            skill_md = (
                parent
                / ".claude"
                / "plugins"
                / "knowledge"
                / "skills"
                / "navigating-docs"
                / "SKILL.md"
            )
            if skill_md.exists():
                return
        pytest.fail("SKILL.md not found")

    def test_skill_md_has_valid_frontmatter(self) -> None:
        """SKILL.md should have valid YAML frontmatter."""
        import re

        cwd = Path.cwd()
        for parent in [cwd, *cwd.parents]:
            skill_md = (
                parent
                / ".claude"
                / "plugins"
                / "knowledge"
                / "skills"
                / "navigating-docs"
                / "SKILL.md"
            )
            if skill_md.exists():
                content = skill_md.read_text()
                match = re.match(r"^---\s*\n(.*?)\n---", content, re.DOTALL)
                assert match, "SKILL.md should have frontmatter"
                frontmatter = yaml.safe_load(match.group(1))
                assert "name" in frontmatter, "SKILL.md should have 'name'"
                assert "description" in frontmatter, "SKILL.md should have 'description'"
                return
        pytest.fail("SKILL.md not found")
