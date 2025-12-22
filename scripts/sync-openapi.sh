#!/usr/bin/env bash

# Syncs OpenAPI specs from upstream repositories.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"

echo "Syncing OpenAPI specs..."

# Node API spec from tenzir/tenzir (at repo root after PR #5624)
echo "Fetching openapi.node.yaml from tenzir/tenzir..."
curl -fsSL "https://raw.githubusercontent.com/tenzir/tenzir/main/openapi.node.yaml" \
  -o "$REPO_ROOT/src/content/apis/openapi.node.yaml" || {
    # Fallback to old location before PR #5624 merges
    echo "  → Trying legacy location..."
    curl -fsSL "https://raw.githubusercontent.com/tenzir/tenzir/main/docs/openapi.node.yaml" \
      -o "$REPO_ROOT/src/content/apis/openapi.node.yaml"
  }
echo "  → Saved to src/content/apis/openapi.node.yaml"

echo "Done!"
