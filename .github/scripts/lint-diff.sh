#!/bin/bash

# lint-diff.sh - Run linting only on changed files in PR
# This script determines changed files in the current PR and runs
# markdownlint, eslint, and prettier only on those files.

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check required commands
if ! command_exists git; then
    print_error "git command not found"
    exit 1
fi

if ! command_exists pnpm; then
    print_error "pnpm command not found"
    exit 1
fi

# Determine the base branch for comparison
# In GitHub Actions, we can use GITHUB_BASE_REF for PR base branch
# For local testing, default to origin/main
if [ -n "$GITHUB_BASE_REF" ]; then
    BASE_BRANCH="origin/$GITHUB_BASE_REF"
    print_info "Using GitHub Actions base branch: $BASE_BRANCH"
elif [ -n "$1" ]; then
    BASE_BRANCH="$1"
    print_info "Using provided base branch: $BASE_BRANCH"
else
    BASE_BRANCH="origin/main"
    print_info "Using default base branch: $BASE_BRANCH"
fi

# Get list of changed files
print_info "Getting list of changed files compared to $BASE_BRANCH..."

# Use git diff to get added and modified files (exclude deleted files)
if ! ALL_CHANGED_FILES=$(git diff --name-only --diff-filter=AM "$BASE_BRANCH"...HEAD 2>/dev/null); then
    print_error "Failed to get changed files. Make sure $BASE_BRANCH exists and is accessible."
    exit 1
fi

# Filter to only include files that actually exist on disk
CHANGED_FILES=""
for file in $ALL_CHANGED_FILES; do
    if [ -f "$file" ]; then
        if [ -z "$CHANGED_FILES" ]; then
            CHANGED_FILES="$file"
        else
            CHANGED_FILES="$CHANGED_FILES
$file"
        fi
    fi
done

# Check if any files were actually changed
if [ -z "$CHANGED_FILES" ]; then
    print_info "No files changed compared to $BASE_BRANCH"
    print_info "✅ All linting checks passed (no files to check)"
    exit 0
fi

# Count total changed files
TOTAL_FILES=$(echo "$CHANGED_FILES" | wc -l)

print_info "Found $TOTAL_FILES changed file(s)"

# Filter files by type
MARKDOWN_FILES=$(echo "$CHANGED_FILES" | grep -E '\.(md|mdx|mdoc)$' || true)
JS_TS_ASTRO_FILES=$(echo "$CHANGED_FILES" | grep -E '\.(js|jsx|ts|tsx|astro|mjs|cjs)$' || true)

# Count files by type (handle empty strings properly)
if [ -n "$MARKDOWN_FILES" ]; then
    MARKDOWN_COUNT=$(echo "$MARKDOWN_FILES" | wc -l)
else
    MARKDOWN_COUNT=0
fi

if [ -n "$JS_TS_ASTRO_FILES" ]; then
    JS_TS_ASTRO_COUNT=$(echo "$JS_TS_ASTRO_FILES" | wc -l)
else
    JS_TS_ASTRO_COUNT=0
fi

print_info "File breakdown:"
print_info "  - Markdown files: $MARKDOWN_COUNT"
print_info "  - JS/TS/Astro files: $JS_TS_ASTRO_COUNT"
print_info "  - All files (for Prettier): $TOTAL_FILES"

# Track linting results
LINT_FAILED=0
FAILED_LINTERS=""

# Run markdownlint on changed markdown files
if [ "$MARKDOWN_COUNT" -gt 0 ]; then
    print_info "Running markdownlint on $MARKDOWN_COUNT markdown file(s)..."
    
    # Convert newline-separated files to space-separated for markdownlint
    MARKDOWN_FILES_ARGS=$(echo "$MARKDOWN_FILES" | tr '\n' ' ')
    
    if ! pnpm exec markdownlint $MARKDOWN_FILES_ARGS; then
        print_error "markdownlint failed"
        LINT_FAILED=1
        FAILED_LINTERS="$FAILED_LINTERS markdownlint"
    else
        print_info "✅ markdownlint passed"
    fi
else
    print_info "⏭️  Skipping markdownlint (no markdown files changed)"
fi

# Run eslint on changed JS/TS/Astro files
if [ "$JS_TS_ASTRO_COUNT" -gt 0 ]; then
    print_info "Running eslint on $JS_TS_ASTRO_COUNT JS/TS/Astro file(s)..."
    
    # Convert newline-separated files to space-separated for eslint
    JS_TS_ASTRO_FILES_ARGS=$(echo "$JS_TS_ASTRO_FILES" | tr '\n' ' ')
    
    if ! pnpm exec eslint $JS_TS_ASTRO_FILES_ARGS; then
        print_error "eslint failed"
        LINT_FAILED=1
        FAILED_LINTERS="$FAILED_LINTERS eslint"
    else
        print_info "✅ eslint passed"
    fi
else
    print_info "⏭️  Skipping eslint (no JS/TS/Astro files changed)"
fi

# Run prettier on all changed files
if [ "$TOTAL_FILES" -gt 0 ]; then
    print_info "Running prettier on $TOTAL_FILES changed file(s)..."
    
    # Convert newline-separated files to space-separated for prettier
    CHANGED_FILES_ARGS=$(echo "$CHANGED_FILES" | tr '\n' ' ')
    
    if ! pnpm exec prettier --check $CHANGED_FILES_ARGS; then
        print_error "prettier failed"
        LINT_FAILED=1
        FAILED_LINTERS="$FAILED_LINTERS prettier"
    else
        print_info "✅ prettier passed"
    fi
else
    print_info "⏭️  Skipping prettier (no files changed)"
fi

# Final result
if [ "$LINT_FAILED" -eq 1 ]; then
    print_error "Linting failed for:$FAILED_LINTERS"
    print_error "Please fix the issues and try again"
    exit 1
else
    print_info "🎉 All linting checks passed!"
    exit 0
fi