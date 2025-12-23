"""CLI entry point for skill-teacher."""

from pathlib import Path

import click
from rich.console import Console

console = Console()

# Fixed paths relative to docs repo root
DOCS_ROOT = Path("src/content/docs")
OUTPUT_ROOT = Path(".claude/plugins/knowledge/skills/navigating-docs")


def get_repo_root() -> Path:
    """Get the docs repo root (where pyproject.toml lives or cwd)."""
    cwd = Path.cwd()
    # Walk up to find the docs repo root (has src/content/docs)
    for parent in [cwd, *cwd.parents]:
        if (parent / "src" / "content" / "docs").is_dir():
            return parent
    # Fallback to cwd
    return cwd


@click.group()
@click.pass_context
def main(ctx: click.Context) -> None:
    """Generate Claude Code skills from Tenzir documentation."""
    ctx.ensure_object(dict)
    ctx.obj["repo_root"] = get_repo_root()


@main.command()
@click.pass_context
def generate_index(ctx: click.Context) -> None:
    """Build YAML indexes from documentation."""
    repo_root: Path = ctx.obj["repo_root"]
    docs_path = repo_root / DOCS_ROOT
    output_path = repo_root / OUTPUT_ROOT / "index"

    console.print(f"[blue]Docs path:[/] {docs_path}")
    console.print(f"[blue]Output path:[/] {output_path}")

    if not docs_path.exists():
        console.print(f"[red]Error:[/] Docs path not found: {docs_path}")
        raise SystemExit(1)

    # Ensure output directory exists
    output_path.mkdir(parents=True, exist_ok=True)

    from skill_teacher.generators.index import generate_all_indexes

    generate_all_indexes(docs_path, output_path)
    console.print("[green]Index generation complete![/]")


@main.command()
@click.pass_context
def generate_summaries(ctx: click.Context) -> None:
    """Build summary files using Claude API."""
    repo_root: Path = ctx.obj["repo_root"]
    docs_path = repo_root / DOCS_ROOT
    output_path = repo_root / OUTPUT_ROOT / "summaries"

    console.print(f"[blue]Docs path:[/] {docs_path}")
    console.print(f"[blue]Output path:[/] {output_path}")

    console.print("[yellow]Summary generation not yet implemented[/]")


@main.command()
@click.pass_context
def validate(ctx: click.Context) -> None:
    """Check generated content for correctness."""
    repo_root: Path = ctx.obj["repo_root"]
    skill_path = repo_root / OUTPUT_ROOT

    console.print(f"[blue]Skill path:[/] {skill_path}")

    if not skill_path.exists():
        console.print(f"[red]Error:[/] Skill path not found: {skill_path}")
        raise SystemExit(1)

    from skill_teacher.validation.schema import validate_skill

    errors = validate_skill(skill_path)
    if errors:
        for error in errors:
            console.print(f"[red]Error:[/] {error}")
        raise SystemExit(1)
    console.print("[green]Validation passed![/]")


@main.command()
@click.option("--all", "rebuild_all", is_flag=True, help="Rebuild everything")
@click.pass_context
def regenerate(ctx: click.Context, rebuild_all: bool) -> None:
    """Full rebuild of skill content."""
    if rebuild_all:
        ctx.invoke(generate_index)
        ctx.invoke(generate_summaries)
        ctx.invoke(validate)
    else:
        console.print("[yellow]Use --all to rebuild everything[/]")


if __name__ == "__main__":
    main()
