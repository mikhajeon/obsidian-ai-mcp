# AI MCP

[![GitHub release (latest by date)](https://img.shields.io/github/v/release/mikhajeon/obsidian-ai-mcp)](https://github.com/mikhajeon/obsidian-ai-mcp/releases)
[![License](https://img.shields.io/github/license/mikhajeon/obsidian-ai-mcp)](LICENSE)

[Installation](#installation) | [What You Can Do](#what-you-can-do) | [Usage](#usage) | [Troubleshooting](#troubleshooting) | [Requirements](#requirements--disclosures) | [Support](#support)

---

**AI MCP** enables Claude Desktop to securely access and work with your Obsidian vault through the Model Context Protocol (MCP). Talk to Claude about your notes, have it create new content, search your vault, and manage files using natural language.

**Privacy Note:** Your vault data stays on your computer. Only your prompts and Claude's responses are sent to Anthropic's servers, and by default aren't used for model training.[^1]

## What You Can Do

Once installed, you can ask Claude to:

- "Read my note called 'Project Ideas' and suggest three new features"
- "Create a new meeting note for today with an agenda template"
- "Search my vault for all notes about machine learning and summarize the key concepts"
- "Update my Daily Note to add these three tasks"
- "List all notes in my Projects folder"
- "Find notes I haven't updated in 30 days"

Claude works directly with your notes using natural language - no need to learn commands or syntax.

## Installation

### Quick Install (Recommended)

1. Open Obsidian **Settings**
2. Go to **Community plugins** → **Browse**
3. Search for **"AI MCP"**
4. Click **Install**, then **Enable**

### Setup Claude Desktop Connection

After installing the plugin:

1. **Generate MCP Client**
   - Open Obsidian Settings → AI MCP
   - Click **"Generate MCP Client"** button
   - You'll see a success notification

2. **Copy Configuration**
   - Click **"Copy Configuration"** button
   - The config is now in your clipboard

3. **Add to Claude Desktop**
   - Open Claude Desktop
   - Go to Settings (gear icon) → Developer
   - Click **"Edit Config"** under "Local MCP servers"
   - Paste the configuration and save

4. **Restart Claude Desktop**
   - Completely quit Claude Desktop (exit from system tray/menu bar)
   - Reopen Claude Desktop

5. **Test It Works**
   - Open a new Claude chat
   - Ask: "Can you list all the notes in my Obsidian vault?"
   - If Claude responds with your notes, you're all set

### Quick Settings

In Obsidian Settings → AI MCP, configure:

| Setting | Recommended |
|---------|-------------|
| Auto-start MCP server | Enable for convenience |
| Enable write operations | Enable to let Claude create/edit notes |
| Enable delete operations | Enable with caution |

## Usage

Talk to Claude naturally about your vault. Here are some examples:

### Reading and Analysis
- "Read my project roadmap and identify any missing milestones"
- "What are the main themes across my daily notes this week?"
- "Summarize my meeting notes from January"

### Content Creation
- "Create a weekly review template in my Templates folder"
- "Draft a blog post outline about [topic] based on my research notes"
- "Add a TODO section to my current daily note"

### Organization
- "List all notes tagged with #project"
- "Find notes that mention both 'Python' and 'data science'"
- "Show me notes I created this month"

### Available Tools

Claude has access to these operations:

| Tool | What It Does | Permission |
|------|--------------|------------|
| `read_note` | Read any note in your vault | Always enabled |
| `write_note` | Create new notes | Requires write permission |
| `update_note` | Edit existing notes | Requires write permission |
| `delete_note` | Delete notes | Requires delete permission |
| `list_notes` | Browse all vault notes | Always enabled |
| `search_vault` | Search note content | Always enabled |

### Plugin Commands

Access via Command Palette (`Ctrl/Cmd + P`):

- **Start MCP Server** - Manually start the server
- **Stop MCP Server** - Stop the running server
- **MCP Server Status** - Check if server is running

## Troubleshooting

### Claude doesn't see my vault

1. **Verify the MCP server is running**
   - Command Palette → "MCP Server Status"
   - Should say "Running"

2. **Check Claude Desktop config**
   - Settings → Developer → "Edit Config"
   - Verify path to `generated_mcp_client.js` is correct
   - Use forward slashes: `C:/Users/...` not `C:\Users\...`

3. **Fully restart Claude Desktop**
   - Quit completely (system tray/menu bar)
   - Wait 5 seconds
   - Reopen

### MCP server won't start

1. **Port 3010 might be in use**
   ```bash
   # Windows
   netstat -ano | findstr :3010

   # macOS/Linux
   lsof -i :3010
   ```

2. **Kill the process if needed**
   ```bash
   npx kill-port 3010
   ```

3. **Check for errors**
   - View → Toggle Developer Tools → Console
   - Look for red error messages

### Tools not working

1. **Enable permissions**
   - Obsidian Settings → AI MCP
   - Toggle on: Enable Write Operations, Enable Delete Operations

2. **Check file paths**
   - Paths should be relative to vault root
   - Use forward slashes: `folder/note.md`
   - Don't include `.obsidian` in paths

### Common Issues

| Problem | Solution |
|---------|----------|
| "Connection refused" | Start MCP server in Obsidian |
| "Port already in use" | Kill process on port 3010 |
| "Path not found" | Fix path in Claude Desktop config |
| Claude shows no tools | Fully restart Claude Desktop |
| "Permission denied" | Enable write/delete in plugin settings |

## Requirements & Disclosures

This plugin requires:

### Claude Desktop Account

You need a Claude Desktop account to use this plugin.
- Sign up: [claude.ai](https://claude.ai)
- Download: [claude.ai/download](https://claude.ai/download)

### Network Usage

**Local:** Plugin runs a WebSocket server on `localhost:3010` for local communication between Obsidian and Claude Desktop.

**Cloud:** When you interact with Claude, your vault content is sent to Anthropic's servers for AI processing. This is how Claude can read and understand your notes.
- Data is processed per [Anthropic's privacy policy](https://www.anthropic.com/legal/privacy)
- Conversations aren't used for training by default

### Technical Requirements

- Obsidian v0.15.0 or higher (Desktop only)
- Node.js v16.0 or higher
- Claude Desktop installed

### File Access

Plugin generates `generated_mcp_client.js` in `.obsidian/plugins/obsidian-ai-mcp/` directory. This file bridges communication between Claude Desktop and Obsidian. No other files outside your vault are accessed.

> **Platform Note:** Primarily tested on Windows. Should work on macOS and Linux but may need additional configuration.

## Features

Technical capabilities:

- **Vault Access**: Read and reference notes while maintaining vault security[^2]
- **Content Creation**: Create and update notes through Claude
- **File Management**: Delete notes with configurable permissions
- **Semantic Search**: Search vault based on content and context
- **List Operations**: Browse and discover all notes
- **Configurable Permissions**: Control exactly what Claude can do

The plugin creates a local MCP server that acts as a secure bridge between your vault and Claude Desktop.[^3] All communication uses the JSON-RPC 2.0 protocol.

## Security

### Path Validation
- All file operations validate paths to prevent directory traversal
- Paths are normalized and checked against vault root
- Attempts to access files outside vault are blocked

### Permissions
- **Read**: Always enabled (core functionality)
- **Write**: Toggle to control note creation/modification
- **Delete**: Toggle to control deletion (disabled by default)

### Local Communication
- MCP server runs locally on your machine
- WebSocket connection is local only (127.0.0.1)
- Only Claude Desktop (with your config) can connect
- Desktop-only (not mobile) for full control

### Report Security Issues

If you find a security vulnerability:
1. **Do NOT** open a public GitHub issue
2. [Create a private security advisory](https://github.com/mikhajeon/obsidian-ai-mcp/security/advisories/new)
3. Include steps to reproduce
4. Allow time for a fix before public disclosure

## Development

For development setup, see [DEVELOPMENT.md](DEVELOPMENT.md).

## Support

- **Questions** [Open a Discussion](https://github.com/mikhajeon/obsidian-ai-mcp/discussions)
- **Bug Reports** [Open an Issue](https://github.com/mikhajeon/obsidian-ai-mcp/issues)
- **Feature Requests** [Open an Issue](https://github.com/mikhajeon/obsidian-ai-mcp/issues)

When reporting issues, include:
- Operating System and version
- Obsidian version
- Node.js version (`node --version`)
- Plugin version
- Steps to reproduce
- Console errors (View → Toggle Developer Tools)

## Changelog

See [GitHub Releases](https://github.com/mikhajeon/obsidian-ai-mcp/releases) for version history.

## License

[MIT License](LICENSE)

Copyright (c) 2025 mikhajeon

## Acknowledgments

- Built with [Model Context Protocol SDK](https://github.com/modelcontextprotocol/sdk)
- Thanks to the Obsidian and Anthropic teams

---

## Footnotes

[^1]: For information about data privacy, see [Claude AI's data usage policy](https://www.anthropic.com/legal/privacy)

[^2]: The plugin uses Obsidian's Vault API to ensure all file operations respect vault settings and constraints

[^3]: The MCP server implements protocol specification version 2024-11-05. For more about MCP, see [MCP Introduction](https://modelcontextprotocol.io/introduction)
