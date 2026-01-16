#!/usr/bin/env node
// TEMPORARY WORKAROUND: This script and the following dependencies in
// package.json can be removed once we upgrade to the official starlight-llms-txt
// release. When removing, delete these packages from package.json:
//   - starlight-llms-txt (change to official npm package)
//   - github-slugger
//   - hast-util-select
//   - micromatch
//   - rehype-parse
//   - rehype-remark
//   - remark-gfm
//   - remark-stringify
//   - unified
//   - unist-util-remove
// Also remove the "postinstall" script from package.json.
import {
  existsSync,
  symlinkSync,
  unlinkSync,
  readdirSync,
  renameSync,
  lstatSync,
  rmSync,
} from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

const nodeModules = join(projectRoot, "node_modules");
const targetPackage = "starlight-llms-txt";
const targetPath = join(nodeModules, targetPackage);
const monorepoBackupName = "starlight-llms-txt-monorepo";
const monorepoBackupPath = join(nodeModules, monorepoBackupName);

// Check if bun installed the monorepo directly (no .pnpm directory)
const pnpmDir = join(nodeModules, ".pnpm");
const hasPnpm = existsSync(pnpmDir);

if (hasPnpm) {
  // pnpm installation - use original logic
  const dirs = readdirSync(pnpmDir);
  const monorepoDir = dirs.find((d) =>
    d.includes("starlight-llms-txt-monorepo"),
  );

  if (monorepoDir) {
    const actualPackagePath = join(
      pnpmDir,
      monorepoDir,
      "node_modules",
      "starlight-llms-txt-monorepo",
      "packages",
      "starlight-llms-txt",
    );

    if (existsSync(actualPackagePath)) {
      if (existsSync(targetPath)) {
        try {
          unlinkSync(targetPath);
        } catch {
          // Ignore errors
        }
      }

      const relativePath = join(
        ".pnpm",
        monorepoDir,
        "node_modules",
        "starlight-llms-txt-monorepo",
        "packages",
        "starlight-llms-txt",
      );

      try {
        symlinkSync(relativePath, targetPath, "dir");
        const { execSync } = await import("child_process");
        execSync("pnpm install", {
          cwd: actualPackagePath,
          stdio: "inherit",
        });
      } catch (error) {
        console.error(
          "Failed to create symlink or install dependencies:",
          error.message,
        );
        process.exit(1);
      }
    }
  }
} else {
  // bun installation - monorepo is installed directly at targetPath
  // Check if targetPath is a directory containing the monorepo structure
  const packagesDir = join(targetPath, "packages", targetPackage);

  if (existsSync(packagesDir) && existsSync(join(packagesDir, "index.ts"))) {
    // This is a monorepo installation - we need to fix it
    try {
      // Check if it's already a symlink (already fixed)
      const stats = lstatSync(targetPath);
      if (stats.isSymbolicLink()) {
        // Already fixed
        process.exit(0);
      }

      // Remove backup if it exists from a previous run
      if (existsSync(monorepoBackupPath)) {
        rmSync(monorepoBackupPath, { recursive: true, force: true });
      }

      // Rename the monorepo directory to a backup name
      renameSync(targetPath, monorepoBackupPath);

      // Create symlink from package name to the actual package inside monorepo
      const relativePath = join(monorepoBackupName, "packages", targetPackage);

      symlinkSync(relativePath, targetPath, "dir");
      console.warn(`Fixed starlight-llms-txt: symlinked to ${relativePath}`);
    } catch (error) {
      console.error(
        "Failed to fix starlight-llms-txt installation:",
        error.message,
      );
      process.exit(1);
    }
  }
  // If packagesDir doesn't exist, the package is already properly installed
}
