import { Plugin, FileSystemAdapter } from 'obsidian';
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

// Minimal WebSocket client using only Node.js built-in modules
const net = require('net');
const crypto = require('crypto');

const WS_PORT = 3010;
const WS_HOST = 'localhost';
let socket = null;
let messageQueue = [];
let isConnected = false;

function createWebSocketKey() {
  return crypto.randomBytes(16).toString('base64');
}

function connect() {
  socket = new net.Socket();

  socket.connect(WS_PORT, WS_HOST, () => {
    // Send WebSocket handshake
    const key = createWebSocketKey();
    const handshake = [
      'GET / HTTP/1.1',
      \`Host: \${WS_HOST}:\${WS_PORT}\`,
      'Upgrade: websocket',
      'Connection: Upgrade',
      \`Sec-WebSocket-Key: \${key}\`,
      'Sec-WebSocket-Version: 13',
      '',
      ''
    ].join('\\r\\n');

    socket.write(handshake);
  });

  let buffer = Buffer.alloc(0);
  let handshakeComplete = false;

  socket.on('data', (data) => {
    buffer = Buffer.concat([buffer, data]);

    if (!handshakeComplete) {
      const headerEnd = buffer.indexOf('\\r\\n\\r\\n');
      if (headerEnd !== -1) {
        const headers = buffer.slice(0, headerEnd).toString();

        if (headers.includes('HTTP/1.1 101')) {
          handshakeComplete = true;
          isConnected = true;
          console.error('[MCP Client] Connected to Obsidian MCP Server');

          buffer = buffer.slice(headerEnd + 4);

          // Send queued messages
          while (messageQueue.length > 0) {
            const msg = messageQueue.shift();
            sendMessage(msg);
          }
        } else {
          console.error('[MCP Client] Handshake failed');
          socket.destroy();
          process.exit(1);
        }
      }
      return;
    }

    // Parse WebSocket frames
    while (buffer.length > 0) {
      if (buffer.length < 2) break;

      const firstByte = buffer[0];
      const secondByte = buffer[1];
      const opcode = firstByte & 0x0F;
      let payloadLength = secondByte & 0x7F;

      let offset = 2;

      if (payloadLength === 126) {
        if (buffer.length < 4) break;
        payloadLength = buffer.readUInt16BE(2);
        offset = 4;
      } else if (payloadLength === 127) {
        if (buffer.length < 10) break;
        payloadLength = Number(buffer.readBigUInt64BE(2));
        offset = 10;
      }

      if (buffer.length < offset + payloadLength) break;

      const payload = buffer.slice(offset, offset + payloadLength);
      buffer = buffer.slice(offset + payloadLength);

      if (opcode === 0x1) { // Text frame
        const message = payload.toString('utf8');
        process.stdout.write(message + '\\n');
      } else if (opcode === 0x8) { // Close frame
        console.error('[MCP Client] Connection closed');
        socket.destroy();
        process.exit(0);
      }
    }
  });

  socket.on('error', (error) => {
    console.error('[MCP Client] Error:', error.message);
    process.exit(1);
  });

  socket.on('close', () => {
    console.error('[MCP Client] Disconnected');
    process.exit(1);
  });
}

function sendMessage(message) {
  if (!socket || !isConnected) {
    messageQueue.push(message);
    return;
  }

  const payload = Buffer.from(message, 'utf8');
  const length = payload.length;

  let frame;
  let maskOffset;

  if (length < 126) {
    frame = Buffer.allocUnsafe(2 + 4 + length);
    frame[0] = 0x81;
    frame[1] = 0x80 | length;
    maskOffset = 2;
  } else if (length < 65536) {
    frame = Buffer.allocUnsafe(4 + 4 + length);
    frame[0] = 0x81;
    frame[1] = 0x80 | 126;
    frame.writeUInt16BE(length, 2);
    maskOffset = 4;
  } else {
    frame = Buffer.allocUnsafe(10 + 4 + length);
    frame[0] = 0x81;
    frame[1] = 0x80 | 127;
    frame.writeBigUInt64BE(BigInt(length), 2);
    maskOffset = 10;
  }

  const maskingKey = crypto.randomBytes(4);
  maskingKey.copy(frame, maskOffset);

  for (let i = 0; i < length; i++) {
    frame[maskOffset + 4 + i] = payload[i] ^ maskingKey[i % 4];
  }

  socket.write(frame);
}

// Read from stdin
let stdinBuffer = '';
process.stdin.on('data', (chunk) => {
  stdinBuffer += chunk.toString();

  const lines = stdinBuffer.split('\\n');
  stdinBuffer = lines.pop() || '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    try {
      JSON.parse(trimmed);
      sendMessage(trimmed);
    } catch (error) {
      console.error('[MCP Client] Invalid JSON:', error.message);
    }
  }
});

process.stdin.on('end', () => {
  if (socket) socket.destroy();
  process.exit(0);
});

process.on('SIGINT', () => {
  if (socket) socket.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  if (socket) socket.destroy();
  process.exit(0);
});

connect();
`;

		const clientPath = `${this.app.vault.configDir}/plugins/obsidian-ai-mcp/generated_mcp_client.js`;

		try {
			await this.app.vault.adapter.write(clientPath, clientCode);
		} catch (error) {
			console.error('Failed to generate generated_mcp_client.js:', error);
			throw error;
		}
	}

	async checkMCPClientExists(): Promise<boolean> {
		const adapter = this.app.vault.adapter;
		if (!(adapter instanceof FileSystemAdapter)) {
			return false;
		}
		const basePath = adapter.getBasePath();
		const clientPath = `${basePath}/${this.app.vault.configDir}/plugins/obsidian-ai-mcp/generated_mcp_client.js`;

		try {
			const fs = require('fs').promises;
			await fs.access(clientPath);
			return true;
		} catch {
			return false;
		}
	}
}
