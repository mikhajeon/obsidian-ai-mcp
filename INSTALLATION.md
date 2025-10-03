# Installation Guide - Obsidian AI MCP

This guide will walk you through installing and setting up the Obsidian AI MCP plugin to connect your vault with Claude Desktop.

## Prerequisites

Before you begin, make sure you have:

- ✅ **Obsidian Desktop** installed (not mobile)
- ✅ **Claude Desktop** app installed ([Download here](https://claude.ai/download))

**Note:** Node.js and Git are only required for manual installation or development (see Step 1, Option B below).

## Installation Steps

### Step 1: Install the Plugin

#### Option A: From Community Plugins (Recommended)

1. Open **Obsidian Settings**
2. Go to **Community plugins** → **Browse**
3. Search for **"Obsidian AI MCP"**
4. Click **Install**
5. Once installed, click **Enable**

That's it! Skip to [Step 2](#step-2-configure-the-plugin) below.

#### Option B: Manual Installation (For Development)

**Additional Prerequisites:**
- **Node.js** v16.0 or higher ([Download here](https://nodejs.org/))
- **Git** ([Download here](https://git-scm.com/))

1. Open your terminal/command prompt

2. Navigate to your vault's plugins folder:
   ```bash
   # Windows
   cd "C:\path\to\your\vault\.obsidian\plugins"

   # macOS/Linux
   cd /path/to/your/vault/.obsidian/plugins
   ```

3. Clone the repository:
   ```bash
   git clone https://github.com/mikhajeon/obsidian-ai-mcp.git
   ```

4. Enter the plugin directory:
   ```bash
   cd obsidian-ai-mcp
   ```

5. Install dependencies:
   ```bash
   npm install
   ```

6. Build the plugin:
   ```bash
   npm run build
   ```

#### Option C: Manual Download (Alternative)

1. Download the latest release from [GitHub Releases](https://github.com/mikhajeon/obsidian-ai-mcp/releases)

2. Extract the files (`main.js`, `manifest.json`, `styles.css`)

3. Create a folder `obsidian-ai-mcp` in your vault's `.obsidian/plugins/` directory

4. Copy the extracted files into that folder

5. Restart Obsidian

6. Go to **Settings** → **Community plugins** → Enable **Obsidian AI MCP**

### Step 2: Configure the Plugin

1. In Obsidian Settings, find **Obsidian AI MCP** in the left sidebar

2. Configure your preferences:

   | Setting | Description | Recommendation |
   |---------|-------------|----------------|
   | **Enable MCP Server** | Auto-start server when Obsidian loads | ✅ Enable for convenience |
   | **Server Port** | Port for WebSocket server | Leave as 3010 (unless in use) |
   | **Enable Search** | Allow Claude to search your vault | ✅ Enable |
   | **Enable Write** | Allow Claude to create/modify notes | ✅ Enable |
   | **Enable Delete** | Allow Claude to delete notes | ⚠️ Enable with caution |

3. Click outside the settings to save

### Step 3: Configure Claude Desktop

This is the most important step - connecting Claude Desktop to your Obsidian vault.

#### Windows

1. Open File Explorer and navigate to:
   ```
   %APPDATA%\Claude\
   ```
   (Paste this in the address bar)

2. Open or create `claude_desktop_config.json`

3. Add this configuration (replace `YOUR_VAULT_PATH`):
   ```json
   {
     "mcpServers": {
       "obsidian": {
         "command": "node",
         "args": ["C:/Users/YourUser/path/to/vault/.obsidian/plugins/obsidian-ai-mcp/mcp-client.js"]
       }
     }
   }
   ```

   **Example:**
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

   ⚠️ **Important:** Use forward slashes (`/`) not backslashes (`\`) in the path!

#### macOS

1. Open Terminal

2. Edit the config file:
   ```bash
   nano ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

3. Add this configuration (replace path):
   ```json
   {
     "mcpServers": {
       "obsidian": {
         "command": "node",
         "args": ["/Users/yourname/path/to/vault/.obsidian/plugins/obsidian-ai-mcp/mcp-client.js"]
       }
     }
   }
   ```

4. Save with `Ctrl+O`, `Enter`, then exit with `Ctrl+X`

#### Linux

1. Open Terminal

2. Edit the config file:
   ```bash
   nano ~/.config/Claude/claude_desktop_config.json
   ```

3. Add this configuration (replace path):
   ```json
   {
     "mcpServers": {
       "obsidian": {
         "command": "node",
         "args": ["/home/yourname/path/to/vault/.obsidian/plugins/obsidian-ai-mcp/mcp-client.js"]
       }
     }
   }
   ```

4. Save with `Ctrl+O`, `Enter`, then exit with `Ctrl+X`

### Step 4: Start the MCP Server

#### Method 1: Auto-start (Recommended)

If you enabled "Enable MCP Server" in settings, the server starts automatically when Obsidian loads.

Just **restart Obsidian** now.

#### Method 2: Manual start

1. Open Obsidian

2. Press `Ctrl+P` (Windows/Linux) or `Cmd+P` (macOS) to open Command Palette

3. Type: `Start MCP Server`

4. Press Enter

You should see a notice: "MCP Server started successfully"

### Step 5: Connect Claude Desktop

1. **Completely quit** Claude Desktop (not just close the window - quit from system tray/menu bar)

2. **Restart** Claude Desktop

3. Open a new chat in Claude

4. Look for the 🔨 tools icon or mention of "obsidian" in Claude's available tools

### Step 6: Test the Connection

Ask Claude something like:

```
Can you list all the notes in my Obsidian vault?
```

or

```
Please read my note called "Daily Notes/2025-10-02"
```

If Claude can respond with your notes, **congratulations! You're all set! 🎉**

## Verification Checklist

Use this checklist to verify everything is working:

- [ ] Plugin appears in Obsidian's Community Plugins list
- [ ] Plugin is toggled ON
- [ ] MCP Server shows as "Running" in Command Palette → "MCP Server Status"
- [ ] `claude_desktop_config.json` has correct path with forward slashes
- [ ] Claude Desktop was fully restarted after config change
- [ ] Claude shows tools/connection to Obsidian in new chat
- [ ] Claude can successfully list or read notes

## Troubleshooting

### "MCP Server failed to start"

**Cause:** Port 3010 might be in use

**Solution:**
1. Check what's using port 3010:
   ```bash
   # Windows
   netstat -ano | findstr :3010

   # macOS/Linux
   lsof -i :3010
   ```

2. Either:
   - Kill that process: `npx kill-port 3010`
   - Change the port in plugin settings

### "Claude doesn't see the Obsidian connection"

**Causes & Solutions:**

1. **Wrong path in config**
   - Double-check the path to `mcp-client.js`
   - Make sure you're using forward slashes (`/`)
   - Path should be absolute, not relative

2. **Claude Desktop not fully restarted**
   - Quit Claude from system tray/menu bar
   - Wait 5 seconds
   - Open Claude Desktop again

3. **MCP Server not running**
   - In Obsidian, run: Command Palette → "MCP Server Status"
   - Should say "Running"
   - If not, run "Start MCP Server"

4. **Node.js not in PATH**
   - Test in terminal: `node --version`
   - If error, reinstall Node.js and check "Add to PATH" option

### "Permission denied" or "Cannot read file"

**Solution:**
Enable the required permissions in plugin settings:
- Enable Search
- Enable Write
- Enable Read (should be on by default)

### Plugin won't load after restart

**Solution:**
1. Check Obsidian console for errors:
   - View → Toggle Developer Tools
   - Look at Console tab for red errors

2. Rebuild the plugin:
   ```bash
   cd /path/to/vault/.obsidian/plugins/obsidian-ai-mcp
   npm run build
   ```

3. Restart Obsidian

## Getting Help

If you're still having issues:

1. **Check the logs:**
   - Obsidian: View → Toggle Developer Tools → Console
   - Look for errors related to "MCP" or "WebSocket"

2. **Report an issue:**
   - Visit: [GitHub Issues](https://github.com/mikhajeon/obsidian-ai-mcp/issues)
   - Include:
     - Your OS and version
     - Obsidian version
     - Node.js version
     - Error messages from console
     - Steps you've tried

3. **Read the FAQ:**
   - Check [README.md](README.md) for common issues

## Next Steps

Now that you're connected:

- Try asking Claude to create daily notes
- Use Claude to search across your vault
- Ask Claude to summarize your notes on specific topics
- Have Claude help organize and link related notes

**Happy note-taking with AI! 🚀**
