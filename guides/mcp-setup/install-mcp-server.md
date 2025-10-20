# Install MCP Server

To install the [Tenzir MCP Server](/reference/mcp-server) server, you can choose between two options:

1. **Docker**: `docker run -i tenzir/mcp`
2. **Native**: `uvx tenzir-mcp`

The Docker version runs a container that bundles the MCP server along with a Tenzir Node installation as a convenient one-stop solution.

The native version only runs the MCP server and you need to make sure that it can access a Tenzir Node installation yourself.

Always running latest versions

For the native installation, the `@latest` suffix ensures you always get the most recent MCP server package from PyPI when launching your MCP clients, at the cost of increased startup time. To reduce initial load time, omit `@latest` and manually refresh the cache with `uvx tenzir-mcp@latest` when you want updates.

For Docker, the `--pull=always` flag serves a similar purpose, ensuring you always pull the latest image before running the container. To avoid the pull overhead on every start, omit this flag and manually update with `docker pull tenzir/mcp` when needed.

## AI agent configuration

[Section titled “AI agent configuration”](#ai-agent-configuration)

All AI agents use the same JSON configuration structure for the Tenzir MCP server. The configuration always follows this pattern:

* Docker

  ```json
  {
    "mcpServers": {
      "tenzir": {
        "command": "docker",
        "args": ["run", "--pull=always", "-i", "tenzir/mcp"],
        "env": {}
      }
    }
  }
  ```

* Native

  ```json
  {
    "mcpServers": {
      "tenzir": {
        "command": "uvx",
        "args": ["tenzir-mcp@latest"],
        "env": {}
      }
    }
  }
  ```

The configuration file location varies by agent. See the specific sections below.

### Claude

[Section titled “Claude”](#claude)

Configure the Tenzir MCP server for [Claude Code](https://claude.ai/code) and [Claude Desktop](https://claude.ai/download).

#### Claude Code

[Section titled “Claude Code”](#claude-code)

For automatic configuration:

* Docker

  ```bash
  claude mcp add tenzir --scope user -- docker run --pull=always -i tenzir/mcp
  ```

* Native

  ```bash
  claude mcp add tenzir --scope user -- uvx tenzir-mcp@latest
  ```

For manual configuration, edit `~/.mcp.json` for user-wide settings or `.mcp.json` in your project directory for project-specific settings.

#### Claude Desktop

[Section titled “Claude Desktop”](#claude-desktop)

Edit the configuration file directly. The location depends on your operating system:

* **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
* **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
* **Linux**: `~/.config/Claude/claude_desktop_config.json`

After updating the configuration, restart Claude Desktop to load the MCP server.

### Gemini CLI

[Section titled “Gemini CLI”](#gemini-cli)

Google’s [Gemini CLI](https://github.com/google-gemini/gemini-cli) supports MCP servers natively. Configure the Tenzir MCP server by editing `~/.gemini/settings.json`.

Gemini Code Assist in VS Code shares the same MCP technology. The configuration automatically applies to both the CLI and VS Code integration.

### VS Code

[Section titled “VS Code”](#vs-code)

[VS Code](https://code.visualstudio.com/) supports MCP servers through [GitHub Copilot](https://github.com/features/copilot) starting with version 1.102.

For project-specific configuration, create `.vscode/mcp.json` in your project root.

For user-wide configuration:

1. Open Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
2. Run `MCP: Open User Configuration`
3. Add the Tenzir server configuration

After configuration:

1. Open the GitHub Copilot chat panel
2. Look for the MCP icon in the chat input
3. Select the Tenzir server from available MCP servers
4. Start interacting with your security pipelines