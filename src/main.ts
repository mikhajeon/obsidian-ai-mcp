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
}
