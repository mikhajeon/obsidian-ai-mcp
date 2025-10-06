import { Plugin } from 'obsidian';
import { MCPPluginSettings, DEFAULT_SETTINGS } from './types/settings';
import { MCPServer } from './mcp/server';
import { VaultService } from './services/vault-service';
import { MCPSettingTab } from './ui/settings-tab';
import { registerCommands } from './commands';

export default class MCPPlugin extends Plugin {
	settings: MCPPluginSettings;
	private mcpServer: MCPServer | null = null;
	private vaultService: VaultService;

	async onload() {
		await this.loadSettings();

		// Initialize services
		this.vaultService = new VaultService(this.app);

		// Register commands
		registerCommands(this);

		// Add settings tab
		this.addSettingTab(new MCPSettingTab(this.app, this));

		// Auto-start MCP server if enabled
		if (this.settings.mcpServerEnabled) {
			await this.startMCPServer();
		}
	}

	async onunload() {
		// Stop MCP server on unload
		if (this.mcpServer) {
			await this.mcpServer.stop();
			this.mcpServer = null;
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async startMCPServer() {
		if (this.mcpServer) {
			return;
		}

		try {
			this.mcpServer = new MCPServer(this.vaultService, this.settings);
			await this.mcpServer.start();
		} catch (error) {
			console.error('Failed to start MCP Server:', error);
			console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
			this.mcpServer = null;
			throw error;
		}
	}

	async stopMCPServer() {
		if (!this.mcpServer) {
			return;
		}

		try {
			await this.mcpServer.stop();
			this.mcpServer = null;
		} catch (error) {
			console.error('Failed to stop MCP Server:', error);
		}
	}

	getMCPServerStatus(): string {
		return this.mcpServer ? 'Running' : 'Stopped';
	}

	async generateMCPClient(): Promise<void> {
		const clientCode = `#!/usr/bin/env node

const WebSocket = require('ws');

const WS_URL = 'ws://localhost:3010';
let ws = null;
let messageQueue = [];

function connect() {
  ws = new WebSocket(WS_URL);

  ws.on('open', () => {
    console.error('[MCP Client] Connected to Obsidian MCP Server on port 3010');

    // Send any queued messages
    while (messageQueue.length > 0 && ws.readyState === WebSocket.OPEN) {
      const msg = messageQueue.shift();
      console.error('[MCP Client] Sending queued message:', msg);
      ws.send(msg);
    }
  });

  ws.on('message', (data) => {
    try {
      const response = data.toString();
      console.error('[MCP Client] Received from server:', response);
      // Forward to stdout (with newline for Claude Desktop)
      process.stdout.write(response + '\\n');
    } catch (error) {
      console.error('[MCP Client] Error processing message:', error.message);
    }
  });

  ws.on('error', (error) => {
    console.error('[MCP Client] WebSocket error:', error.message);
    process.exit(1);
  });

  ws.on('close', () => {
    console.error('[MCP Client] WebSocket connection closed');
    process.exit(1);
  });
}

// Read from stdin (MCP protocol uses newline-delimited JSON)
let buffer = '';
process.stdin.on('data', (chunk) => {
  buffer += chunk.toString();

  // Process complete lines
  const lines = buffer.split('\\n');
  buffer = lines.pop() || ''; // Keep incomplete line in buffer

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    try {
      // Validate JSON
      JSON.parse(trimmed);
      console.error('[MCP Client] Received from stdin:', trimmed);

      if (ws && ws.readyState === WebSocket.OPEN) {
        console.error('[MCP Client] Forwarding to WebSocket');
        ws.send(trimmed);
      } else {
        console.error('[MCP Client] WebSocket not ready, queuing message');
        messageQueue.push(trimmed);
      }
    } catch (error) {
      console.error('[MCP Client] Invalid JSON from stdin:', error.message);
    }
  }
});

process.stdin.on('end', () => {
  console.error('[MCP Client] stdin closed');
  if (ws) ws.close();
  process.exit(0);
});

// Handle termination
process.on('SIGINT', () => {
  if (ws) ws.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  if (ws) ws.close();
  process.exit(0);
});

// Start connection
connect();
`;

		const clientPath = '.obsidian/plugins/obsidian-ai-mcp/mcp-client.js';

		try {
			await this.app.vault.adapter.write(clientPath, clientCode);
		} catch (error) {
			console.error('Failed to generate mcp-client.js:', error);
			throw error;
		}
	}

	async checkMCPClientExists(): Promise<boolean> {
		const basePath = (this.app.vault.adapter as any).basePath;
		const clientPath = `${basePath}/.obsidian/plugins/obsidian-ai-mcp/mcp-client.js`;

		try {
			const fs = require('fs').promises;
			await fs.access(clientPath);
			return true;
		} catch {
			return false;
		}
	}
}
