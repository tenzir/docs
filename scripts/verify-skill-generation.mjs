import { strict as assert } from "node:assert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { buildSkills } from "./generate-skill.mjs";

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "skill-generation-"));

function writeFile(relativePath, content) {
  const fullPath = path.join(tempRoot, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
}

try {
  writeFile(
    "dist/sitemap.md",
    [
      "# Tenzir Documentation Map",
      "",
      "> The low-code data pipeline solution for security teams",
      "> Last updated: 2026-03-06 10:00 UTC",
      "",
      "Tenzir helps security teams process data.",
      "",
      "## [Guides](http://docs.tenzir.com/guides.md)",
      "",
      "Practical guides.",
      "",
      "### [Use OCSF](http://docs.tenzir.com/guides/use-ocsf.md)",
      "",
      "Learn how to work with the schema.",
      "",
      "- Contents",
      "",
      "## [Reference](http://docs.tenzir.com/reference.md)",
      "",
      "Reference material.",
      "",
      "### Standards",
      "",
      "#### [OCSF](http://docs.tenzir.com/reference/ocsf.md)",
      "",
      "The OCSF reference.",
      "",
      "##### [Introduction](http://docs.tenzir.com/reference/ocsf/introduction.md)",
      "",
      "Start here.",
      "",
    ].join("\n"),
  );

  writeFile("dist/guides.md", "# Guides\n");
  writeFile(
    "dist/guides/use-ocsf.md",
    [
      "# Use OCSF",
      "",
      "> Documentation index: https://docs.tenzir.com/llms.txt",
      "",
      "See [Guides](/guides.md), [OCSF](/reference/ocsf.md), and [Introduction](/reference/ocsf/introduction.md).",
      "",
    ].join("\n"),
  );

  writeFile("dist/reference.md", "# Reference\n");
  writeFile(
    "dist/reference/ocsf.md",
    [
      "# OCSF",
      "",
      "> Documentation index: https://docs.tenzir.com/llms.txt",
      "",
      "Open schema overview.",
      "",
      "Continue with [Introduction](/reference/ocsf/introduction.md).",
      "Related guide: [Use OCSF](/guides/use-ocsf.md).",
      "",
    ].join("\n"),
  );
  writeFile(
    "dist/reference/ocsf/introduction.md",
    ["# Introduction", "", "Back to [Overview](/reference/ocsf.md).", ""].join(
      "\n",
    ),
  );

  buildSkills({ cwd: tempRoot });

  assert(fs.existsSync(path.join(tempRoot, "tenzir/SKILL.md")));
  assert(fs.existsSync(path.join(tempRoot, "ocsf/SKILL.md")));

  assert(!fs.existsSync(path.join(tempRoot, "tenzir/reference/ocsf.md")));
  assert(!fs.existsSync(path.join(tempRoot, "tenzir/reference/ocsf")));
  assert(fs.existsSync(path.join(tempRoot, "ocsf/index.md")));
  assert(fs.existsSync(path.join(tempRoot, "ocsf/introduction.md")));
  assert(!fs.existsSync(path.join(tempRoot, "ocsf/reference")));

  const tenzirSkill = fs.readFileSync(
    path.join(tempRoot, "tenzir/SKILL.md"),
    "utf-8",
  );
  assert(tenzirSkill.includes("name: tenzir"));
  assert(!tenzirSkill.includes("reference/ocsf"));
  assert(!tenzirSkill.includes("#### [OCSF]"));
  assert(!tenzirSkill.includes("### Standards"));
  assert(tenzirSkill.includes("### [Use OCSF](guides/use-ocsf.md)"));

  const ocsfSkill = fs.readFileSync(
    path.join(tempRoot, "ocsf/SKILL.md"),
    "utf-8",
  );
  assert(ocsfSkill.includes("name: ocsf"));
  assert(ocsfSkill.includes("# OCSF Documentation Map"));
  assert(ocsfSkill.includes("## [OCSF](index.md)"));
  assert(ocsfSkill.includes("### [Introduction](introduction.md)"));
  assert(!ocsfSkill.includes("reference/ocsf"));

  const tenzirGuide = fs.readFileSync(
    path.join(tempRoot, "tenzir/guides/use-ocsf.md"),
    "utf-8",
  );
  assert(!tenzirGuide.includes("Documentation index:"));
  assert(tenzirGuide.includes("[Guides](../guides.md)"));
  assert(!tenzirGuide.includes("[OCSF]("));
  assert(!tenzirGuide.includes("[Introduction]("));
  assert(
    tenzirGuide.includes("See [Guides](../guides.md), OCSF, and Introduction."),
  );

  const ocsfIndex = fs.readFileSync(
    path.join(tempRoot, "ocsf/index.md"),
    "utf-8",
  );
  assert(!ocsfIndex.includes("Documentation index:"));
  assert(ocsfIndex.includes("[Introduction](introduction.md)"));
  assert(!ocsfIndex.includes("[Use OCSF]("));
  assert(ocsfIndex.includes("Related guide: Use OCSF."));

  const ocsfIntroduction = fs.readFileSync(
    path.join(tempRoot, "ocsf/introduction.md"),
    "utf-8",
  );
  assert(ocsfIntroduction.includes("[Overview](index.md)"));
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
