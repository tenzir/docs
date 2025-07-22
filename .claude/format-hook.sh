#!/bin/bash
# Auto-format hook for Claude edits

# Read stdin to get file path
stdin_data=$(cat)
FILE_PATH=$(echo "$stdin_data" | jq -r '.tool_input.file_path // .tool_output.file_path // empty' 2>/dev/null)


echo "🔧 Format hook triggered for: $FILE_PATH" >&2

# Skip if no file path
[[ -z "$FILE_PATH" ]] && exit 0

# Resolve symbolic links
if [[ -L "$FILE_PATH" ]]; then
    RESOLVED_PATH=$(readlink "$FILE_PATH")
    # If it's a relative symlink, make it absolute
    if [[ ! "$RESOLVED_PATH" =~ ^/ ]]; then
        RESOLVED_PATH="$(dirname "$FILE_PATH")/$RESOLVED_PATH"
    fi
    echo "📎 Resolved symlink: $FILE_PATH -> $RESOLVED_PATH" >&2
    FILE_PATH="$RESOLVED_PATH"
fi

# Run markdownlint for markdown files
if [[ "$FILE_PATH" =~ \.(md|mdx|mdoc)$ ]]; then
    markdownlint "$FILE_PATH" --fix
fi

# Run prettier on all supported files
if [[ "$FILE_PATH" =~ \.(md|mdx|mdoc|js|jsx|ts|tsx|astro|json|yaml|yml)$ ]]; then
    prettier --write "$FILE_PATH"
fi