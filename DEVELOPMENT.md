# Development Guide - Obsidian AI MCP

This guide covers development setup, contributing guidelines, and project architecture for the Obsidian AI MCP plugin.

## Development Prerequisites

Before you begin development, make sure you have:

- **Node.js** v16.0 or higher ([Download here](https://nodejs.org/))
- **npm** or **yarn**
- **Git** ([Download here](https://git-scm.com/))
- **Obsidian** for testing
- **TypeScript** 4.7+

## Setting Up Development Environment

### 1. Clone the repository

```bash
git clone https://github.com/mikhajeon/obsidian-ai-mcp.git
cd obsidian-ai-mcp
```

### 2. Install dependencies

```bash
npm install
```

### 3. Build the plugin

```bash
# Development mode (watch for changes)
npm run dev

# Production build
npm run build
```

### 4. Link to your vault for testing

```bash
# Create a symbolic link from your vault to the development folder
# Windows (PowerShell as Admin)
New-Item -ItemType SymbolicLink -Path "C:\path\to\vault\.obsidian\plugins\obsidian-ai-mcp" -Target "C:\path\to\dev\obsidian-ai-mcp"

# macOS/Linux
ln -s /path/to/dev/obsidian-ai-mcp /path/to/vault/.obsidian/plugins/obsidian-ai-mcp
```

### 5. Reload Obsidian

Reload Obsidian to load the plugin and start development.

## Version Bumping

```bash
# Bump version (updates manifest.json, package.json, and versions.json)
npm version patch   # 0.0.1 → 0.0.2
npm version minor   # 0.0.1 → 0.1.0
npm version major   # 0.0.1 → 1.0.0
```

## Project Structure

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
├── generated_mcp_client.js # stdio-to-WebSocket bridge for Claude Desktop
├── manifest.json          # Obsidian plugin manifest
├── package.json           # npm package configuration
├── tsconfig.json          # TypeScript configuration
├── esbuild.config.mjs     # Build configuration
└── README.md             # Main documentation
```

## Architecture Overview

```
┌─────────────────┐         WebSocket         ┌──────────────────┐
│                 │◄───────── Port 3010 ──────►│                  │
│  Claude Desktop │                            │     Obsidian     │
│                 │        MCP Protocol        │   MCP Plugin     │
│  (MCP Client)   │◄──────────────────────────►│  (MCP Server)    │
└─────────────────┘                            └──────────────────┘
        │                                               │
        │         stdio bridge                          │
        ▼         (generated_mcp_client.js)            ▼
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
- **MCP Client Bridge** (`generated_mcp_client.js`): Bridges stdio (Claude Desktop) to WebSocket (Obsidian)

## Contributing

Contributions are welcome! Please:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Make** your changes
4. **Test** thoroughly (build and run in Obsidian)
5. **Commit** with clear messages (`git commit -m 'Add amazing feature'`)
6. **Push** to your fork (`git push origin feature/amazing-feature`)
7. **Open** a Pull Request

### Contribution Guidelines

- Follow existing code style (TypeScript + ESLint)
- Add comments for complex logic
- Test your changes in a real vault
- Update documentation if adding features
- Be respectful and constructive in discussions

## Code Standards

See [CLAUDE.md](CLAUDE.md) for detailed coding standards, architecture principles, and development patterns specific to this project.

## Testing

### Manual Testing

1. Build the plugin: `npm run build`
2. Reload Obsidian
3. Test MCP server connection with Claude Desktop
4. Verify all tools work correctly

### Common Test Cases

- Reading notes
- Creating new notes
- Updating existing notes
- Deleting notes
- Searching vault
- Listing all notes
- Error handling (invalid paths, permissions, etc.)

## Debugging

### Obsidian Developer Tools

1. Open Obsidian
2. View → Toggle Developer Tools
3. Check Console tab for errors
4. Set breakpoints in Sources tab

### MCP Server Logs

The plugin logs MCP operations to the Obsidian console. Check for:
- Connection status
- Tool invocations
- Error messages
- WebSocket communication

## Release Checklist

Before releasing a new version:

- [ ] All TypeScript errors resolved
- [ ] No console.log statements (use logger utility)
- [ ] Settings migration tested (if schema changed)
- [ ] MCP connection tested with Claude Desktop
- [ ] Version bumped in manifest.json and package.json
- [ ] CHANGELOG updated
- [ ] Build succeeds: `npm run build`
- [ ] Plugin loads in Obsidian without errors
- [ ] Tag release on GitHub
- [ ] Attach manifest.json, main.js, styles.css to release
- [ ] Release notes include manual installation instructions
- [ ] Release notes mention Node.js prerequisite (v16.0+)

## Troubleshooting Development Issues

### Plugin Not Loading

1. Check Obsidian console for errors
2. Verify build succeeded without errors
3. Ensure files are in correct location
4. Restart Obsidian

### Build Errors

1. Clear node_modules: `rm -rf node_modules && npm install`
2. Check TypeScript version compatibility
3. Verify tsconfig.json settings

### MCP Connection Issues

1. Check WebSocket server is running
2. Verify port 3010 is not blocked
3. Test connection with curl or wscat
4. Check firewall settings

## Resources

- [Obsidian Plugin API](https://github.com/obsidianmd/obsidian-api)
- [Model Context Protocol Spec](https://modelcontextprotocol.io/docs)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Getting Help

- **Questions?** [Open a Discussion](https://github.com/mikhajeon/obsidian-ai-mcp/discussions)
- **Bug Reports** [Open an Issue](https://github.com/mikhajeon/obsidian-ai-mcp/issues)
- **Feature Requests** [Open an Issue](https://github.com/mikhajeon/obsidian-ai-mcp/issues)

## License

[MIT License](LICENSE)

Copyright (c) 2025 mikhajeon
