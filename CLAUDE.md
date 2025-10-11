# Obsidian AI MCP Plugin - Claude Code Instructions

## Project Context

This is an Obsidian plugin that implements the Model Context Protocol (MCP) to connect Obsidian with the Claude.ai desktop app. It serves as a bridge, allowing Claude to interact with your Obsidian vault through MCP servers.

**Key Capabilities:**
- Expose Obsidian vault content to Claude via MCP
- Provide tools for Claude to read, search, and potentially modify notes
- Enable bidirectional communication between Claude.ai desktop and Obsidian
- Support real-time vault operations from Claude interface

## Architecture Principles

### 1. MCP Server Implementation
- Implement standard MCP protocol endpoints (tools, resources, prompts)
- Use WebSocket or stdio transport for Claude desktop communication
- Handle connection lifecycle (init, ready, error, shutdown)
- Implement proper error handling and graceful degradation

### 2. Plugin Structure
- Keep MCP server logic separate from Obsidian plugin logic
- Use dependency injection for testability
- Implement service layer pattern for vault operations
- Maintain clear boundaries between MCP protocol and Obsidian API

### 3. Security & Privacy
- **CRITICAL**: Never expose vault content without explicit user consent
- Implement granular permissions for vault access
- Validate all incoming MCP requests
- Sanitize file paths to prevent directory traversal
- Log all external operations for user transparency
- Provide clear UI indicators when MCP server is active

## Folder Structure (Best Practice)

```
src/
  main.ts                    # Plugin entry, minimal lifecycle only

  mcp/
    server.ts                # MCP server implementation
    protocol.ts              # MCP protocol types and interfaces
    transport.ts             # WebSocket/stdio transport layer
    handlers/
      tools.ts               # MCP tools handlers
      resources.ts           # MCP resources handlers
      prompts.ts             # MCP prompts handlers

  services/
    vault-service.ts         # Vault operations (read, write, search)
    file-service.ts          # File system operations
    metadata-service.ts      # Frontmatter and metadata handling
    search-service.ts        # Search and query operations

  commands/
    index.ts                 # Command registration
    start-mcp-server.ts      # Start MCP server command
    stop-mcp-server.ts       # Stop MCP server command
    connection-status.ts     # Show connection status

  ui/
    settings-tab.ts          # Plugin settings UI
    status-view.ts           # MCP connection status view
    modals/
      permission-modal.ts    # Request user permission for operations
      connection-modal.ts    # Connection configuration

  utils/
    logger.ts                # Logging utilities
    validators.ts            # Input validation
    constants.ts             # Constants and enums
    error-handler.ts         # Centralized error handling

  types/
    settings.ts              # Settings interface
    mcp.ts                   # MCP-specific types
    vault.ts                 # Vault operation types

  __tests__/                 # Unit and integration tests
    mcp/
    services/
    utils/

manifest.json              # Plugin manifest
styles.css                 # Optional styles
esbuild.config.mjs         # Build configuration
tsconfig.json              # TypeScript configuration
```

## Code Standards

### TypeScript Configuration
- Maintain strict mode: `"strict": true`
- Enable `strictNullChecks`, `noImplicitAny`, `strictFunctionTypes`
- Use ESNext modules
- Target ES6 minimum for compatibility

### Coding Conventions
1. **File Size**: Max 250 lines per file. Split if larger.
2. **Function Size**: Max 50 lines per function. Extract helpers if needed.
3. **Naming**:
   - Use PascalCase for classes and interfaces
   - Use camelCase for functions and variables
   - Use UPPER_SNAKE_CASE for constants
   - Prefix interfaces with 'I' only if needed for clarity (not required)
4. **Error Handling**:
   - Always use try-catch for async operations
   - Create custom error classes for different error types
   - Log errors with context (file, line, operation)
   - Show user-friendly messages via Notice
5. **Async/Await**:
   - Prefer async/await over promise chains
   - Always await async operations
   - Handle errors at appropriate level

### MCP-Specific Patterns

#### Tool Implementation
```typescript
// src/mcp/handlers/tools.ts
export class ToolHandler {
  constructor(private vaultService: VaultService) {}

  async handleToolCall(toolName: string, args: unknown): Promise<ToolResult> {
    switch (toolName) {
      case 'read_note':
        return await this.readNote(args);
      case 'search_vault':
        return await this.searchVault(args);
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  private async readNote(args: unknown): Promise<ToolResult> {
    const { path } = this.validateReadNoteArgs(args);
    const content = await this.vaultService.readFile(path);
    return { content, isError: false };
  }
}
```

#### Service Layer Pattern
```typescript
// src/services/vault-service.ts
export class VaultService {
  constructor(private app: App) {}

  async readFile(path: string): Promise<string> {
    const file = this.app.vault.getAbstractFileByPath(path);
    if (!file || !(file instanceof TFile)) {
      throw new FileNotFoundError(path);
    }
    return await this.app.vault.read(file);
  }

  async searchFiles(query: string): Promise<SearchResult[]> {
    // Implement search logic
  }
}
```

## Development Workflow

### 1. Start Development
```bash
npm install
npm run dev  # Watch mode
```

### 2. Testing
- Write unit tests for services and utilities
- Write integration tests for MCP handlers
- Mock Obsidian API for testing
- Test with actual Claude desktop app for E2E validation

### 3. Type Safety
- No `any` types allowed (use `unknown` and type guards)
- Define explicit interfaces for all data structures
- Use type guards for runtime validation
- Leverage TypeScript's type inference

### 4. Pre-Push Checklist
Before pushing code (especially for Vercel auto-deploy):
- [ ] Fix all TypeScript errors
- [ ] No `any` types (@typescript-eslint/no-explicit-any)
- [ ] No `null` used as index type
- [ ] Run `npm run build` successfully
- [ ] Test MCP server connectivity
- [ ] Update version in manifest.json if needed
- [ ] Update CHANGELOG if significant changes

## Dependencies Management

### Core Dependencies
- `obsidian` - Required, provided by Obsidian
- MCP SDK - Install official MCP client/server library
- WebSocket library (if using WebSocket transport)

### Minimize Bundle Size
- Avoid large dependencies
- Use tree-shaking friendly imports
- Consider bundling vs external dependencies
- Check bundle size after build

## Settings Structure

```typescript
// src/types/settings.ts
export interface MCPPluginSettings {
  // Server Configuration
  mcpServerEnabled: boolean;
  serverPort: number;
  transportType: 'websocket' | 'stdio';

  // Security & Permissions
  requirePermissionForReads: boolean;
  requirePermissionForWrites: boolean;
  allowedPaths: string[];
  blockedPaths: string[];

  // Features
  enableSearch: boolean;
  enableMetadata: boolean;
  enableWrite: boolean;

  // Advanced
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  maxConcurrentRequests: number;
}

export const DEFAULT_SETTINGS: MCPPluginSettings = {
  mcpServerEnabled: false,
  serverPort: 3000,
  transportType: 'websocket',
  requirePermissionForReads: true,
  requirePermissionForWrites: true,
  allowedPaths: [],
  blockedPaths: [],
  enableSearch: true,
  enableMetadata: true,
  enableWrite: false,
  logLevel: 'info',
  maxConcurrentRequests: 5,
};
```

## Error Handling Strategy

### Custom Error Classes
```typescript
// src/utils/errors.ts
export class MCPError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'MCPError';
  }
}

export class FileNotFoundError extends MCPError {
  constructor(path: string) {
    super(`File not found: ${path}`, 'FILE_NOT_FOUND');
  }
}

export class PermissionDeniedError extends MCPError {
  constructor(operation: string) {
    super(`Permission denied: ${operation}`, 'PERMISSION_DENIED');
  }
}
```

### Error Response Pattern
```typescript
try {
  const result = await operation();
  return { success: true, data: result };
} catch (error) {
  if (error instanceof MCPError) {
    return { success: false, error: error.message, code: error.code };
  }
  return { success: false, error: 'Unknown error occurred' };
}
```

## Performance Considerations

1. **Lazy Loading**: Load MCP server only when enabled
2. **Debouncing**: Debounce file system watchers
3. **Caching**: Cache frequently accessed files/metadata
4. **Batch Operations**: Support batch reads/searches
5. **Resource Limits**: Implement rate limiting and max payload size
6. **Memory Management**: Clean up resources on unload

## Documentation Requirements

### Code Documentation
- JSDoc comments for all public APIs
- Document complex algorithms inline
- Explain MCP protocol decisions
- Document security considerations

### User Documentation
- README: Clear setup instructions
- How to connect to Claude desktop
- Security and privacy explanation
- Troubleshooting common issues
- Example use cases

## Integration with AGENTS.md

This CLAUDE.md is **project-specific** and works alongside AGENTS.md:
- **AGENTS.md**: General Obsidian plugin development guidelines (read this first)
- **CLAUDE.md**: MCP-specific architecture and patterns for this project

Follow all guidelines from AGENTS.md regarding:
- Versioning and releases
- Manifest requirements
- UX/copy guidelines
- Security policies
- Performance best practices

## MCP Protocol References

- MCP Specification: https://modelcontextprotocol.io/docs
- MCP TypeScript SDK: https://github.com/modelcontextprotocol/typescript-sdk
- Claude Desktop Integration: https://docs.anthropic.com/claude/docs/desktop-app

## Common MCP Operations

### Register MCP Tools
```typescript
const tools = [
  {
    name: 'read_note',
    description: 'Read content of a note from the vault',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Path to the note' }
      },
      required: ['path']
    }
  },
  {
    name: 'search_vault',
    description: 'Search for notes in the vault',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        limit: { type: 'number', description: 'Max results' }
      },
      required: ['query']
    }
  }
];
```

### Handle MCP Resources
```typescript
const resources = [
  {
    uri: 'obsidian://vault/daily-notes',
    name: 'Daily Notes',
    description: 'Access to daily notes',
    mimeType: 'text/markdown'
  }
];
```

## Obsidian API Best Practices

### Critical API Usage Guidelines

1. **Use `Vault#configDir` instead of hardcoding `.obsidian`**
   - Obsidian's config directory is user-configurable (default: `.obsidian`)
   - Always use `this.app.vault.configDir` to access the configured value
   - Example:
   ```typescript
   // ❌ Wrong
   const path = '.obsidian/plugins/my-plugin/data.json';

   // ✅ Correct
   const path = `${this.app.vault.configDir}/plugins/my-plugin/data.json`;
   ```

2. **Use `vault.process()` for atomic file modifications**
   - Prefer `vault.process()` over `vault.modify()` for atomic operations
   - `process()` ensures file operations complete successfully before committing
   - Example:
   ```typescript
   // ❌ Avoid
   await this.app.vault.modify(file, content);

   // ✅ Preferred
   await this.app.vault.process(file, () => content);
   ```

3. **Use `app.fileManager.trashFile()` for deletions**
   - Respects user preferences (trash vs permanent delete)
   - Don't use `vault.delete()` directly
   - Example:
   ```typescript
   // ❌ Wrong
   await this.app.vault.delete(file);

   // ✅ Correct
   await this.app.fileManager.trashFile(file);
   ```

4. **Avoid `any` type casting - use `instanceof` checks**
   - Use `FileSystemAdapter` with proper type guards
   - Access vault base path type-safely with `getBasePath()`
   - Example:
   ```typescript
   // ❌ Wrong
   const basePath = (this.app.vault.adapter as any).basePath;

   // ✅ Correct
   import { FileSystemAdapter } from 'obsidian';

   const adapter = this.app.vault.adapter;
   if (adapter instanceof FileSystemAdapter) {
     const basePath = adapter.getBasePath();
   }
   ```

5. **Always use `normalizePath()` for path handling**
   - Import from `obsidian` module
   - Ensures cross-platform compatibility
   - Prevents directory traversal attacks
   - Example:
   ```typescript
   import { normalizePath } from 'obsidian';

   const safePath = normalizePath(userInputPath);
   ```

### Settings UI Guidelines

1. **Use sentence case for all settings**
   - ❌ Wrong: "Auto-Start MCP Server"
   - ✅ Correct: "Auto-start MCP server"

2. **Use `.setHeading()` API for section headings**
   ```typescript
   // ✅ Correct
   new Setting(containerEl)
     .setName('Permissions')
     .setHeading();
   ```

3. **Never use inline styles - use CSS classes**
   - Create styles in `styles.css`
   - Reference via `cls` parameter
   ```typescript
   // ❌ Wrong
   el.style.marginBottom = '20px';

   // ✅ Correct
   el.createDiv({ cls: 'my-section' });
   ```

### Security Best Practices

1. **Never use `innerHTML` or `outerHTML`**
   - Use `.setText()`, `.createEl()`, or `.createDiv()` instead
   - Prevents XSS vulnerabilities

2. **Always validate and sanitize file paths**
   - Check for directory traversal (`..`)
   - Use `normalizePath()`
   - Validate file extensions

3. **Implement proper resource cleanup**
   - Clean up event listeners in `onunload()`
   - Close WebSocket connections
   - Cancel pending operations

### Required Policy Disclosures

If your plugin requires any of the following, add a "Policy Disclosures" section to README.md:

1. **Account requirement** (e.g., Claude Desktop, external services)
2. **Network usage** (local servers, external APIs, cloud services)
3. **File access outside vault** (system files, config files)

Example:
```markdown
## Policy Disclosures

### Account Requirement
This plugin requires the Claude Desktop app to be installed and configured.

### Network Use
- Local WebSocket server on port 3010 for plugin-to-Claude communication
- Claude Desktop may send data to Anthropic's cloud services

### File Access
Creates a generated_mcp_client.js file in the .obsidian/plugins directory.
```

## AI Assistant Instructions

When working on this codebase:

1. **Always maintain separation of concerns**: MCP protocol logic should be isolated from Obsidian API interactions
2. **Prioritize security**: Validate all inputs, check permissions, sanitize paths
3. **Write testable code**: Use dependency injection, avoid tight coupling
4. **Keep files small**: Split large files proactively
5. **Document decisions**: Especially around MCP protocol implementation choices
6. **Think about user experience**: Connection status, error messages, permission requests
7. **Reference existing patterns**: Check AGENTS.md for Obsidian conventions
8. **Follow Obsidian API best practices**: See "Obsidian API Best Practices" section above

## Version Control

- Commit messages: Use conventional commits (feat:, fix:, docs:, refactor:, test:)
- Branch strategy: Feature branches from master
- No build artifacts in git (.gitignore for main.js, node_modules/)

## Release Checklist

- [ ] All TypeScript errors resolved
- [ ] No console.log statements (use logger utility)
- [ ] Settings migration tested (if schema changed)
- [ ] MCP connection tested with Claude desktop
- [ ] Version bumped in manifest.json and package.json
- [ ] CHANGELOG updated
- [ ] Build succeeds: `npm run build`
- [ ] Plugin loads in Obsidian without errors
- [ ] Tag release on GitHub
- [ ] Attach manifest.json, main.js, styles.css to release
