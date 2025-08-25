#!/usr/bin/env node
import { existsSync, symlinkSync, unlinkSync, readdirSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

// Find the actual installation path
const nodeModules = join(projectRoot, "node_modules");
const targetPackage = "starlight-llms-txt";
const targetPath = join(nodeModules, targetPackage);

// Find the monorepo installation in .pnpm
const pnpmDir = join(nodeModules, ".pnpm");

if (existsSync(pnpmDir)) {
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
      // Remove existing symlink if it exists
      if (existsSync(targetPath)) {
        try {
          unlinkSync(targetPath);
        } catch {
          // Ignore errors
        }
      }

      // Create correct symlink
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
        // Successfully fixed symlink

        // Install dependencies for the fork
        const { execSync } = await import("child_process");
        // Installing dependencies for fork
        execSync("pnpm install", {
          cwd: actualPackagePath,
          stdio: "inherit",
        });
        // Dependencies installed successfully
      } catch (error) {
        console.error(
          "Failed to create symlink or install dependencies:",
          error.message,
        );
        process.exit(1);
      }
    } else {
      console.warn("starlight-llms-txt package not found in expected location");
    }
  } else {
    console.warn("starlight-llms-txt-monorepo not found in node_modules/.pnpm");
  }
} else {
  // No .pnpm directory found - skipping symlink fix
}
