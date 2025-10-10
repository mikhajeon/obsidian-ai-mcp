import { App, PluginSettingTab, Setting, Notice, Platform } from 'obsidian';
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
		const setupSection = containerEl.createDiv();
		setupSection.style.marginBottom = '20px';
		setupSection.style.padding = '15px';
		setupSection.style.backgroundColor = 'var(--background-secondary)';
		setupSection.style.borderRadius = '6px';

		const setupHeader = setupSection.createEl('div');
		setupHeader.style.marginTop = '0';
		setupHeader.style.marginBottom = '10px';
		setupHeader.style.fontWeight = '600';
		setupHeader.style.fontSize = '1.1em';
		setupHeader.setText('Claude Desktop setup');

		const setupDesc = setupSection.createDiv();
		setupDesc.style.marginBottom = '10px';
		setupDesc.style.fontSize = '0.9em';
		setupDesc.style.opacity = '0.8';

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
		const vaultPath = (this.app.vault.adapter as any).basePath;
		const clientPath = `${vaultPath}/.obsidian/plugins/obsidian-ai-mcp/generated_mcp_client.js`;
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

		// Check if mcp-client.js exists
		const clientExists = await this.plugin.checkMCPClientExists();

		if (!clientExists) {
			const warningDiv = setupSection.createDiv();
			warningDiv.style.marginBottom = '10px';
			warningDiv.style.padding = '10px';
			warningDiv.style.backgroundColor = 'var(--background-modifier-error)';
			warningDiv.style.borderRadius = '4px';
			warningDiv.style.fontSize = '0.9em';
			warningDiv.setText('⚠️ generated_mcp_client.js not found. Click "Generate MCP Client" below first.');
		}

		// Code block with config
		const codeBlock = setupSection.createEl('pre');
		codeBlock.style.backgroundColor = 'var(--background-primary)';
		codeBlock.style.padding = '10px';
		codeBlock.style.borderRadius = '4px';
		codeBlock.style.fontSize = '0.85em';
		codeBlock.style.overflow = 'auto';
		codeBlock.style.marginBottom = '10px';
		codeBlock.setText(configJson);

		// Buttons
		const buttonsContainer = setupSection.createDiv();
		buttonsContainer.style.display = 'flex';
		buttonsContainer.style.gap = '10px';

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

		const commandsDesc = containerEl.createDiv();
		commandsDesc.style.marginBottom = '10px';
		commandsDesc.style.fontSize = '0.9em';
		commandsDesc.style.opacity = '0.8';
		commandsDesc.setText('Access these commands via Command Palette (Ctrl/Cmd + P):');

		const commandsList = containerEl.createEl('ul');
		commandsList.style.marginLeft = '20px';
		commandsList.style.fontSize = '0.9em';
		commandsList.style.opacity = '0.8';
		commandsList.style.listStyleType = 'disc';

		const commands = [
			'Start MCP server - Manually start the server',
			'Stop MCP server - Stop the running server',
			'MCP server status - Check server status',
		];

		commands.forEach((cmd) => {
			const li = commandsList.createEl('li');
			li.style.marginBottom = '4px';
			li.setText(cmd);
		});
	}
}
