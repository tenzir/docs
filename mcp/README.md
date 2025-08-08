# Tenzir Docs MCP Server

A local MCP server for Tenzir documentation access.

## Docker Build Instructions

To build the Docker image, run from the docs directory (`/home/benno/tenzir/docs`):

```bash
docker build -f Dockerfile.mcp -t tenzir-docs-mcp .
```

This will (inside the docker image):
- Install Python 3.13 and required system dependencies (ripgrep)
- Copy the MCP server code
- Install Python dependencies via uv
- Copy the documentation content from `../src/content/docs`
- Set up a non-root user for security

## Running the Docker Container

To add it to Claude Code, run this:

```bash
claude mcp add tenzir-docs -- docker run -i tenzir-docs-mcp
```

Adjust the command as needed for other MCP clients.

You can also run a standalone version, for example for testing:

```bash
docker run -i tenzir-docs-mcp
```

## Architecture

The server contains a full copy of the documentation, so it runs fully
local and does not need any outgoing internet access to work.

## Available Tools

- `summary`: Get a summary of the Tenzir documentation
- `search_docs`: Search through documentation
- `read_docs_page`: Read the content of a specific documentation page
- `view_docs_image`: Look at an image from the tenzir docs
