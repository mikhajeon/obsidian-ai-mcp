# Obsidian AI MCP

[![GitHub release (latest by date)](https://img.shields.io/github/v/release/mikhajeon/obsidian-ai-mcp)](https://github.com/mikhajeon/obsidian-ai-mcp/releases)
[![License](https://img.shields.io/github/license/mikhajeon/obsidian-ai-mcp)](LICENSE)

[Features](#features) | [Installation](#installation) | [Configuration](#configuration) | [Troubleshooting](#troubleshooting) | [Security](#security) | [Development](#development) | [Support](#support)

---

**Obsidian AI MCP** enables AI applications like Claude Desktop to securely access and work with your Obsidian vault through the Model Context Protocol (MCP). MCP is an open protocol that standardizes how AI applications can interact with external data sources and tools while maintaining security and user control.[^1]

This plugin creates a local WebSocket-based MCP server that runs within Obsidian, acting as a secure bridge between your vault and AI applications like Claude Desktop. This means AI assistants can read your notes, create new content, search your vault, and manage files - but only when you allow it and only through the server's controlled API. The server never gives AI applications direct filesystem access to your vault.[^2]

**Privacy Note:** When using Claude Desktop with this plugin, your conversations with Claude are not used to train Anthropic's models by default.[^3]

## Features

When connected to an MCP client like Claude Desktop, this plugin enables:

- **📖 Vault Access**: Read and reference your notes while maintaining your vault's security[^4]
- **✍️ Content Creation**: Create and update notes through AI interactions
- **🗑️ File Management**: Delete notes with configurable permissions
- **🔍 Semantic Search**: Search your vault based on content and context
- **📋 List Operations**: Browse and discover all notes in your vault
- **⚙️ Configurable Permissions**: Control exactly what operations AI can perform

All features require an MCP-compatible client like Claude Desktop, as this plugin provides the server component that enables these integrations. The plugin does not modify Obsidian's functionality directly - instead, it creates a secure bridge that allows AI applications to work with your vault in powerful ways.

## Prerequisites

### Required

- **Obsidian** v0.15.0 or higher (Desktop only)
- **Claude Desktop** installed and configured ([Download here](https://claude.ai/download))
- **Node.js** v16.0 or higher ([Download here](https://nodejs.org/))

### Recommended

- Basic familiarity with command line/terminal
- Understanding of file paths on your operating system

## Installation

### From Community Plugins (Recommended)

1. Open **Obsidian Settings**
2. Go to **Community plugins** → **Browse**
3. Search for **"Obsidian AI MCP"**
4. Click **Install**
5. Once installed, click **Enable**

That's it! The plugin is now installed.

### Manual Installation (For Development)

Only needed if you want to install before the plugin is available in Community Plugins or for development:

1. Download the latest release from [GitHub Releases](https://github.com/mikhajeon/obsidian-ai-mcp/releases)
2. Extract `main.js`, `manifest.json`, and `styles.css` to:
   ```
   {vault}/.obsidian/plugins/obsidian-ai-mcp/
   ```
3. Reload Obsidian
4. Go to Settings → Community plugins → Enable "Obsidian AI MCP"

## Configuration

### 1. Configure Obsidian Plugin

1. Open **Obsidian Settings** → **Obsidian AI MCP**

2. Configure your preferences:

   | Setting | Description | Recommended |
   |---------|-------------|-------------|
   | **Enable MCP Server** | Auto-start server when Obsidian loads | ✅ Enable for convenience |
   | **Server Port** | WebSocket port (default: 3010) | Leave as 3010 unless in use |
   | **Enable Search** | Allow Claude to search vault | ✅ Enable |
   | **Enable Write** | Allow Claude to create/modify notes | ✅ Enable |
   | **Enable Delete** | Allow Claude to delete notes | ⚠️ Enable with caution |

3. Click outside settings to save

### 2. Configure Claude Desktop

This is the **most important step** - connecting Claude Desktop to your Obsidian vault.

#### Locate Claude Desktop Config File

- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

#### Add MCP Server Configuration

Open `claude_desktop_config.json` and add this configuration:

```json
{
  "mcpServers": {
    "obsidian": {
      "command": "node",
      "args": ["/absolute/path/to/vault/.obsidian/plugins/obsidian-ai-mcp/mcp-client.js"]
    }
  }
}
```

> **⚠️ Critical:**
> - Use **absolute paths** (not relative)
> - Windows users must use **forward slashes** (`/`) not backslashes (`\`)
> - Replace `/absolute/path/to/vault` with your actual vault path

**Example for Windows:**
```json
{
  "mcpServers": {
    "obsidian": {
      "command": "node",
      "args": ["C:/Users/John/Documents/MyVault/.obsidian/plugins/obsidian-ai-mcp/mcp-client.js"]
    }
  }
}
```

**Example for macOS:**
```json
{
  "mcpServers": {
    "obsidian": {
      "command": "node",
      "args": ["/Users/john/Documents/MyVault/.obsidian/plugins/obsidian-ai-mcp/mcp-client.js"]
    }
  }
}
```

**Example for Linux:**
```json
{
  "mcpServers": {
    "obsidian": {
      "command": "node",
      "args": ["/home/john/Documents/MyVault/.obsidian/plugins/obsidian-ai-mcp/mcp-client.js"]
    }
  }
}
```

### 3. Start the MCP Server

**Option A - Auto-start (Recommended):**
1. Ensure "Enable MCP Server" is toggled ON in plugin settings
2. Restart Obsidian
3. Server starts automatically on launch

**Option B - Manual:**
1. Press `Ctrl/Cmd + P` to open Command Palette
2. Type and run: **"Start MCP Server"**
3. You should see: "MCP Server started successfully"

### 4. Connect Claude Desktop

1. **Completely quit** Claude Desktop (exit from system tray/menu bar, not just close window)
2. **Restart** Claude Desktop
3. Open a new chat
4. Look for the 🔨 tools icon or "obsidian" in available tools

### 5. Test the Connection

Ask Claude:
```
Can you list all the notes in my Obsidian vault?
```

or

```
Please read my note called "README"
```

If Claude responds with your vault content, **congratulations! You're all set! 🎉**

## Usage

Once connected, Claude Desktop can interact with your vault using natural language.

### Example Commands

- "Read the note called 'Project Ideas'"
- "Create a new note called 'Meeting Notes' with today's agenda"
- "Search my vault for notes about 'machine learning'"
- "Update my Daily Note to add a new task: review pull requests"
- "List all notes in my Projects folder"
- "Delete the note 'Scratch Pad'"

### Available MCP Tools

Claude has access to these tools:

| Tool | Description | Parameters | Permission Required |
|------|-------------|------------|---------------------|
| `read_note` | Read content of a note | `path`: Note path | Read (always enabled) |
| `write_note` | Create a new note | `path`: Note path<br>`content`: Note content | Write |
| `update_note` | Update existing note | `path`: Note path<br>`content`: New content | Write |
| `delete_note` | Delete a note | `path`: Note path | Delete |
| `list_notes` | List all notes in vault | None | Read (always enabled) |
| `search_vault` | Search vault content | `query`: Search term | Search |

### Plugin Commands

Access these through Command Palette (`Ctrl/Cmd + P`):

| Command | Description |
|---------|-------------|
| `Start MCP Server` | Manually start the MCP server |
| `Stop MCP Server` | Stop the running MCP server |
| `MCP Server Status` | Check if server is running |

## Troubleshooting

If you encounter issues:

### ❌ MCP Server Won't Start

**Issue:** Error message when starting server or server status shows "Stopped"

**Solutions:**

1. **Check if port 3010 is already in use:**
   ```bash
   # Windows
   netstat -ano | findstr :3010

   # macOS/Linux
   lsof -i :3010
   ```

2. **Kill the process using the port:**
   ```bash
   npx kill-port 3010
   ```

3. **Or change the port:**
   - Go to Obsidian Settings → Obsidian AI MCP → Server Port
   - Change to a different port (e.g., 3011)
   - Update `claude_desktop_config.json` if you're using stdio transport

4. **Check Obsidian console for errors:**
   - View → Toggle Developer Tools → Console tab
   - Look for red error messages

### ❌ Claude Desktop Doesn't See Obsidian Connection

**Issue:** Claude doesn't show Obsidian tools or connection

**Solutions:**

1. **Verify config file path is correct:**
   - Open `claude_desktop_config.json`
   - Confirm the path to `mcp-client.js` is absolute and correct
   - Test the path exists: `ls /path/to/mcp-client.js` (should not error)

2. **Use forward slashes in paths (Windows):**
   ```json
   ✅ "C:/Users/John/Vault/.obsidian/plugins/obsidian-ai-mcp/mcp-client.js"
   ❌ "C:\Users\John\Vault\.obsidian\plugins\obsidian-ai-mcp\mcp-client.js"
   ```

3. **Fully restart Claude Desktop:**
   - **Windows**: Right-click system tray icon → Quit
   - **macOS**: Claude menu → Quit Claude
   - **Linux**: Close window and ensure process is killed
   - Wait 5 seconds, then reopen

4. **Verify MCP server is running:**
   - In Obsidian: Command Palette → "MCP Server Status"
   - Should say "Running"
   - If not, run "Start MCP Server"

5. **Test Node.js is available:**
   ```bash
   node --version
   ```
   - Should show v16.0 or higher
   - If error, reinstall Node.js and ensure it's in PATH

### ❌ Tools Not Working

**Issue:** Claude sees Obsidian connection but tools fail or error

**Solutions:**

1. **Enable required permissions:**
   - Obsidian Settings → Obsidian AI MCP
   - Toggle ON: Enable Search, Enable Write (if needed)

2. **Check file paths in Claude requests:**
   - Paths should be relative to vault root
   - Use forward slashes: `folder/note.md`
   - Don't include `.obsidian` in paths

3. **View detailed error logs:**
   - Obsidian: View → Toggle Developer Tools → Console
   - Look for errors when Claude tries to use tools

4. **Verify vault service is working:**
   - Try reading a known note through Claude
   - If that fails, check file permissions on vault folder

### 💡 Common Issues

| Symptom | Likely Cause | Solution |
|---------|--------------|----------|
| "Connection refused" | MCP server not running | Start server in Obsidian |
| "ECONNRESET" | Port already in use | Change port or kill process |
| "Path not found" | Wrong path in config | Fix `claude_desktop_config.json` |
| Claude shows no tools | Config not loaded | Fully restart Claude Desktop |
| "Permission denied" | Permissions disabled | Enable in plugin settings |

## Security

### Path Validation

- All file operations validate paths to prevent directory traversal attacks
- Paths are normalized and checked against vault root
- Attempts to access files outside vault are blocked

### Configurable Permissions

Control exactly what AI assistants can do:

- **Read**: Always enabled (required for basic functionality)
- **Search**: Toggle to control vault-wide search capability
- **Write**: Toggle to control note creation and modification
- **Delete**: Toggle to control note deletion (disabled by default)

### Local-Only Communication

- MCP server runs locally on your machine
- WebSocket connection is local (127.0.0.1)
- No data is sent to external servers by this plugin
- Only Claude Desktop (with your explicit configuration) can connect

### Desktop-Only Plugin

- Plugin only works on desktop Obsidian (not mobile)
- Requires local Node.js installation
- Ensures full control over your vault environment

### Reporting Security Issues

If you discover a security vulnerability, please:

1. **Do NOT** open a public GitHub issue
2. Email the maintainer: [Create a private security advisory](https://github.com/mikhajeon/obsidian-ai-mcp/security/advisories/new)
3. Include detailed steps to reproduce
4. Allow reasonable time for a fix before public disclosure

## Architecture

```
┌─────────────────┐         WebSocket         ┌──────────────────┐
│                 │◄───────── Port 3010 ──────►│                  │
│  Claude Desktop │                            │     Obsidian     │
│                 │        MCP Protocol        │   MCP Plugin     │
│  (MCP Client)   │◄──────────────────────────►│  (MCP Server)    │
└─────────────────┘                            └──────────────────┘
        │                                               │
        │         stdio bridge                          │
        ▼         (mcp-client.js)                      ▼
┌─────────────────┐                          ┌──────────────────┐
│  Node Process   │                          │  Vault Service   │
│  JSON-RPC 2.0   │                          │  File Operations │
└─────────────────┘                          └──────────────────┘
                                                       │
                                                       ▼
                                              ┌──────────────────┐
                                              │  Your Vault      │
                                              │  .md files       │
                                              └──────────────────┘
```

### Components

- **MCP Server** (`src/mcp/server.ts`): WebSocket server implementing MCP protocol 2024-11-05
- **Vault Service** (`src/services/vault-service.ts`): Handles all vault file operations with security checks
- **Tool Handlers** (`src/mcp/handlers/tools.ts`): Implements MCP tool handlers for each operation
- **MCP Client Bridge** (`mcp-client.js`): Bridges stdio (Claude Desktop) to WebSocket (Obsidian)

## Development

### Prerequisites

- **Node.js** v16+
- **npm** or **yarn**
- **Obsidian** for testing
- **TypeScript** 4.7+

### Setting Up Development Environment

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mikhajeon/obsidian-ai-mcp.git
   cd obsidian-ai-mcp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the plugin:**
   ```bash
   # Development mode (watch for changes)
   npm run dev

   # Production build
   npm run build
   ```

4. **Link to your vault for testing:**
   ```bash
   # Create a symbolic link from your vault to the development folder
   # Windows (PowerShell as Admin)
   New-Item -ItemType SymbolicLink -Path "C:\path\to\vault\.obsidian\plugins\obsidian-ai-mcp" -Target "C:\path\to\dev\obsidian-ai-mcp"

   # macOS/Linux
   ln -s /path/to/dev/obsidian-ai-mcp /path/to/vault/.obsidian/plugins/obsidian-ai-mcp
   ```

5. **Reload Obsidian** to load the plugin

### Version Bumping

```bash
# Bump version (updates manifest.json, package.json, and versions.json)
npm version patch   # 0.0.1 → 0.0.2
npm version minor   # 0.0.1 → 0.1.0
npm version major   # 0.0.1 → 1.0.0
```

### Project Structure

```
obsidian-ai-mcp/
├── src/
│   ├── commands/           # Obsidian commands (start/stop/status)
│   │   └── index.ts
│   ├── mcp/               # MCP server implementation
│   │   ├── server.ts      # WebSocket server + MCP protocol
│   │   └── handlers/
│   │       └── tools.ts   # Tool handlers (read/write/search/etc)
│   ├── services/          # Business logic
│   │   └── vault-service.ts  # Vault file operations
│   ├── types/             # TypeScript type definitions
│   │   └── settings.ts    # Plugin settings interface
│   ├── ui/                # User interface
│   │   └── settings-tab.ts   # Settings UI
│   └── main.ts            # Plugin entry point
├── mcp-client.js          # stdio-to-WebSocket bridge for Claude Desktop
├── manifest.json          # Obsidian plugin manifest
├── package.json           # npm package configuration
├── tsconfig.json          # TypeScript configuration
├── esbuild.config.mjs     # Build configuration
└── README.md             # This file
```

### Contributing

Contributions are welcome! Please:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Make** your changes
4. **Test** thoroughly (build and run in Obsidian)
5. **Commit** with clear messages (`git commit -m 'Add amazing feature'`)
6. **Push** to your fork (`git push origin feature/amazing-feature`)
7. **Open** a Pull Request

#### Contribution Guidelines

- Follow existing code style (TypeScript + ESLint)
- Add comments for complex logic
- Test your changes in a real vault
- Update documentation if adding features
- Be respectful and constructive in discussions

## Support

- 💬 **Questions?** [Open a Discussion](https://github.com/mikhajeon/obsidian-ai-mcp/discussions)
- 🐛 **Bug Reports** [Open an Issue](https://github.com/mikhajeon/obsidian-ai-mcp/issues)
- 💡 **Feature Requests** [Open an Issue](https://github.com/mikhajeon/obsidian-ai-mcp/issues)

When reporting issues, please include:

- Operating System and version
- Obsidian version
- Node.js version (`node --version`)
- Plugin version
- Steps to reproduce
- Error messages from Obsidian Developer Tools Console

## Changelog

See [GitHub Releases](https://github.com/mikhajeon/obsidian-ai-mcp/releases) for detailed changelog information.

### Version History

#### 0.0.1 (2025-10-03)
- Initial beta release
- Full CRUD operations for notes (read, write, update, delete)
- WebSocket-based MCP server on configurable port
- Vault search and list functionality
- Configurable permissions system
- Auto-start option
- Commands for server management

## License

[MIT License](LICENSE)

Copyright (c) 2025 mikhajeon

## Acknowledgments

- Built with [Model Context Protocol SDK](https://github.com/modelcontextprotocol/sdk)
- Inspired by the need for seamless AI-vault integration
- Thanks to the Obsidian and Anthropic teams for making this possible

---

## Footnotes

[^1]: For more information about the Model Context Protocol, see [MCP Introduction](https://modelcontextprotocol.io/introduction)

[^2]: The MCP server implements the protocol specification version 2024-11-05. All communication follows the JSON-RPC 2.0 standard.

[^3]: For information about Claude's data privacy and security, see [Claude AI's data usage policy](https://www.anthropic.com/legal/privacy)

[^4]: The plugin uses Obsidian's Vault API to ensure all file operations respect vault settings and constraints
