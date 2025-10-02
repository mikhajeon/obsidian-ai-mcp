# MCP Setup Guide

This guide will help you connect Claude Desktop to your Obsidian vault through the MCP server.

## What You Can Do

Once connected, Claude can:
- **Read notes**: Access any note in your vault
- **Write notes**: Create new notes
- **Update notes**: Modify existing notes
- **Delete notes**: Remove notes (requires permission)
- **List notes**: Browse all notes in your vault
- **Search vault**: Find notes containing specific text

## Setup Instructions

### 1. Enable the Plugin in Obsidian

1. Reload Obsidian or enable the "Obsidian AI MCP" plugin in Settings → Community plugins
2. Go to Settings → Obsidian AI MCP
3. Configure your preferences:
   - **Enable MCP Server**: Toggle ON
   - **Server Port**: 3010 (default, change if needed)
   - **Transport Type**: WebSocket
   - **Enable Write Operations**: Toggle ON to allow Claude to create/update notes
   - **Enable Delete Operations**: Toggle OFF for safety (enable only when needed)

### 2. Start the MCP Server

**Option A: Auto-start**
- If "Enable MCP Server" is ON in settings, the server starts automatically when Obsidian loads

**Option B: Manual start**
- Open Command Palette (Ctrl/Cmd + P)
- Run: "Start MCP Server"
- Check status with: "MCP Server Status"

### 3. Connect from Claude Desktop

**Location of Claude Desktop config file:**
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

**IMPORTANT:** A client script `mcp-client.js` has been created in the plugin directory. You need to reference its full path.

Add this configuration to `claude_desktop_config.json`:

**Windows:**
```json
{
    "mcpServers": {
      "obsidian": {
        "command": "node",
        "args":
  ["C:\\Users\\Mikha\\Vault2-plugin_making\\.obsidian\\plugins\\obsidian-ai-mcp\\mcp-client.js"]
    }
  }
}
```

**macOS/Linux:**
```json
{
  "mcpServers": {
    "obsidian": {
      "command": "node",
      "args": ["/full/path/to/.obsidian/plugins/obsidian-ai-mcp/mcp-client.js"]
    }
  }
}
```

**Replace the path** with the actual full path to your `mcp-client.js` file in the plugin directory.

### 4. Restart Claude Desktop

After updating the configuration:
1. Close Claude Desktop completely
2. Reopen Claude Desktop
3. The Obsidian MCP server should now be available

## Usage Examples

Once connected, you can ask Claude:

- "Read the note at daily/2024-01-15.md"
- "Create a new note at ideas/new-project.md with content about..."
- "Search my vault for notes about machine learning"
- "List all notes in the projects folder"
- "Update the note at tasks/todo.md to add..."

## Available Tools

### read_note
Read content from a note.
- **path** (required): Path to the note (e.g., "folder/note.md")

### write_note
Create a new note.
- **path** (required): Path for the new note
- **content** (required): Note content
- **overwrite** (optional): Whether to overwrite if exists (default: false)

### update_note
Update an existing note.
- **path** (required): Path to the note
- **content** (required): New content

### delete_note
Delete a note (requires "Enable Delete Operations" in settings).
- **path** (required): Path to the note

### list_notes
List all notes in vault or folder.
- **folderPath** (optional): Specific folder to list

### search_vault
Search for notes containing text.
- **query** (required): Search text
- **limit** (optional): Max results (default: 50)

## Security Settings

Protect your vault with these settings:

- **Require Permission for Reads**: Ask before Claude reads notes
- **Require Permission for Writes**: Ask before Claude modifies notes
- **Enable Delete Operations**: Control delete access (OFF by default)

## Troubleshooting

### Server won't start
- Check if port 3010 is already in use
- Try a different port in settings
- Check Obsidian console for errors (Ctrl+Shift+I)

### Claude can't connect
- Ensure MCP server is running (check status)
- Verify port number matches in both Obsidian and Claude config
- Check firewall settings
- Restart both Obsidian and Claude Desktop

### Connection drops
- Check Obsidian console for WebSocket errors
- Restart the MCP server
- Check network/firewall settings

## Advanced Configuration

### Custom Port
Change the port in Settings → Obsidian AI MCP → Server Port, then update the WebSocket URL in your Claude config.

### Path Restrictions
- All paths must be `.md` files
- Directory traversal (`..`) is blocked for security
- Paths are relative to vault root

## Development

To test the server manually:
```javascript
const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:3010');

ws.on('open', () => {
  // List available tools
  ws.send(JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list'
  }));

  // Read a note
  ws.send(JSON.stringify({
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'read_note',
      arguments: { path: 'test.md' }
    }
  }));
});

ws.on('message', (data) => {
  console.log('Response:', data.toString());
});
```

## Support

For issues, check:
1. Obsidian console (Ctrl+Shift+I) for errors
2. MCP server status command
3. Claude Desktop logs
4. Project GitHub issues
