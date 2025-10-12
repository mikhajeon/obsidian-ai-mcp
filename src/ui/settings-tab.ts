import { App, PluginSettingTab, Setting, Notice, Platform, FileSystemAdapter } from 'obsidian';
import MCPPlugin from '../main';

export class MCPSettingTab extends PluginSettingTab {
	plugin: MCPPlugin;

	constructor(app: App, plugin: MCPPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		this.displayAsync();
	}

	async displayAsync(): Promise<void> {
		const { containerEl } = this;

		containerEl.empty();

		// Claude Desktop setup section (first, without heading)
		const setupSection = containerEl.createDiv({ cls: 'ai-mcp-setup-section' });

		const setupHeader = setupSection.createEl('div', { cls: 'ai-mcp-setup-header' });
		setupHeader.setText('Claude Desktop setup');

		const setupDesc = setupSection.createDiv({ cls: 'ai-mcp-setup-desc' });

		// Get config file path based on platform
		let configPath = '';
		if (Platform.isWin) {
			configPath = '%APPDATA%\\Claude\\claude_desktop_config.json';
		} else if (Platform.isMacOS) {
			configPath = '~/Library/Application Support/Claude/claude_desktop_config.json';
		} else {
			configPath = '~/.config/Claude/claude_desktop_config.json';
		}

		setupDesc.setText(`Copy this configuration to: ${configPath}`);

		// Generate vault path
		const adapter = this.app.vault.adapter;
		if (!(adapter instanceof FileSystemAdapter)) {
			setupSection.createDiv({ cls: 'ai-mcp-warning' }).setText('⚠️ File system adapter not available. Cannot generate MCP client path.');
			return;
		}
		const vaultPath = adapter.getBasePath();
		const clientPath = `${vaultPath}/${this.app.vault.configDir}/plugins/obsidian-ai-mcp/generated_mcp_client.js`;
		// Convert backslashes to forward slashes for JSON
		const normalizedPath = clientPath.replace(/\\/g, '/');

		const configJson = `{
  "mcpServers": {
    "obsidian": {
      "command": "node",
      "args": ["${normalizedPath}"]
    }
  }
}`;

		// Check if generated_mcp_client.js exists
		const clientExists = await this.plugin.checkMCPClientExists();

		if (!clientExists) {
			const warningDiv = setupSection.createDiv({ cls: 'ai-mcp-warning' });
			warningDiv.setText('⚠️ generated_mcp_client.js not found. Click "Generate MCP Client" below first.');
		}

		// Code block with config
		const codeBlock = setupSection.createEl('pre', { cls: 'ai-mcp-code-block' });
		codeBlock.setText(configJson);

		// Buttons
		const buttonsContainer = setupSection.createDiv({ cls: 'ai-mcp-button-container' });

		new Setting(buttonsContainer)
			.setName('')
			.setDesc('')
			.addButton((button) => {
				button
					.setButtonText('Generate MCP Client')
					.onClick(async () => {
						try {
							await this.plugin.generateMCPClient();
							new Notice('MCP client generated successfully!');
							// Refresh settings display
							this.display();
						} catch (error) {
							console.error('Error generating generated_mcp_client.js:', error);
							new Notice('Failed to generate MCP client. Check console for details.');
						}
					});

				// Highlight if client doesn't exist
				if (!clientExists) {
					button.setCta();
				}
			})
			.addButton((button) =>
				button
					.setButtonText('Copy Configuration')
					.setDisabled(!clientExists)
					.onClick(async () => {
						await navigator.clipboard.writeText(configJson);
						new Notice('Configuration copied to clipboard!');
					})
			);

		// General settings (no heading, at top)
		new Setting(containerEl)
			.setName('Auto-start MCP server')
			.setDesc('Automatically start the MCP server when Obsidian launches')
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.mcpServerEnabled)
					.onChange(async (value) => {
						this.plugin.settings.mcpServerEnabled = value;
						await this.plugin.saveSettings();
					})
			);

		// Permissions section
		new Setting(containerEl)
			.setName('Permissions')
			.setHeading();

		new Setting(containerEl)
			.setName('Enable write operations')
			.setDesc('Allow Claude to create and update notes')
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.enableWrite)
					.onChange(async (value) => {
						this.plugin.settings.enableWrite = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('Enable delete operations')
			.setDesc('Allow Claude to delete notes (use with caution)')
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.enableDelete)
					.onChange(async (value) => {
						this.plugin.settings.enableDelete = value;
						await this.plugin.saveSettings();
					})
			);

		// Available commands section
		new Setting(containerEl)
			.setName('Available commands')
			.setHeading();

		const commandsDesc = containerEl.createDiv({ cls: 'ai-mcp-commands-desc' });
		commandsDesc.setText('Access these commands via Command Palette (Ctrl/Cmd + P):');

		const commandsList = containerEl.createEl('ul', { cls: 'ai-mcp-commands-list' });

		const commands = [
			'Start MCP server - Manually start the server',
			'Stop MCP server - Stop the running server',
			'MCP server status - Check server status',
		];

		commands.forEach((cmd) => {
			const li = commandsList.createEl('li');
			li.setText(cmd);
		});
	}
}
