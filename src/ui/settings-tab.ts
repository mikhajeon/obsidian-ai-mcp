import { App, PluginSettingTab, Setting } from 'obsidian';
import MCPPlugin from '../main';

export class MCPSettingTab extends PluginSettingTab {
	plugin: MCPPlugin;

	constructor(app: App, plugin: MCPPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		// Header
		containerEl.createEl('h2', { text: 'Obsidian MCP Server Settings' });

		// Server Configuration Section
		containerEl.createEl('h3', { text: 'Server Configuration' });

		new Setting(containerEl)
			.setName('Enable MCP Server')
			.setDesc('Enable the MCP server to allow Claude to access your vault')
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.mcpServerEnabled)
					.onChange(async (value) => {
						this.plugin.settings.mcpServerEnabled = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('Server Port')
			.setDesc('Port for the MCP server (WebSocket mode only)')
			.addText((text) =>
				text
					.setPlaceholder('3000')
					.setValue(String(this.plugin.settings.serverPort))
					.onChange(async (value) => {
						const port = parseInt(value);
						if (!isNaN(port) && port > 0 && port < 65536) {
							this.plugin.settings.serverPort = port;
							await this.plugin.saveSettings();
						}
					})
			);

		new Setting(containerEl)
			.setName('Transport Type')
			.setDesc('Communication method (stdio for Claude Desktop)')
			.addDropdown((dropdown) =>
				dropdown
					.addOption('stdio', 'STDIO (Claude Desktop)')
					.addOption('websocket', 'WebSocket')
					.setValue(this.plugin.settings.transportType)
					.onChange(async (value) => {
						this.plugin.settings.transportType = value as 'websocket' | 'stdio';
						await this.plugin.saveSettings();
					})
			);

		// Security & Permissions Section
		containerEl.createEl('h3', { text: 'Security & Permissions' });

		new Setting(containerEl)
			.setName('Require Permission for Reads')
			.setDesc('Ask for permission before allowing Claude to read notes')
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.requirePermissionForReads)
					.onChange(async (value) => {
						this.plugin.settings.requirePermissionForReads = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('Require Permission for Writes')
			.setDesc('Ask for permission before allowing Claude to modify notes')
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.requirePermissionForWrites)
					.onChange(async (value) => {
						this.plugin.settings.requirePermissionForWrites = value;
						await this.plugin.saveSettings();
					})
			);

		// Features Section
		containerEl.createEl('h3', { text: 'Features' });

		new Setting(containerEl)
			.setName('Enable Search')
			.setDesc('Allow Claude to search your vault')
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.enableSearch)
					.onChange(async (value) => {
						this.plugin.settings.enableSearch = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('Enable Write Operations')
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
			.setName('Enable Delete Operations')
			.setDesc('Allow Claude to delete notes (use with caution)')
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.enableDelete)
					.onChange(async (value) => {
						this.plugin.settings.enableDelete = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('Enable Metadata Access')
			.setDesc('Allow Claude to access note metadata and frontmatter')
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.enableMetadata)
					.onChange(async (value) => {
						this.plugin.settings.enableMetadata = value;
						await this.plugin.saveSettings();
					})
			);

		// Advanced Section
		containerEl.createEl('h3', { text: 'Advanced' });

		new Setting(containerEl)
			.setName('Log Level')
			.setDesc('Logging verbosity level')
			.addDropdown((dropdown) =>
				dropdown
					.addOption('debug', 'Debug')
					.addOption('info', 'Info')
					.addOption('warn', 'Warning')
					.addOption('error', 'Error')
					.setValue(this.plugin.settings.logLevel)
					.onChange(async (value) => {
						this.plugin.settings.logLevel = value as
							| 'debug'
							| 'info'
							| 'warn'
							| 'error';
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('Max Concurrent Requests')
			.setDesc('Maximum number of simultaneous requests')
			.addText((text) =>
				text
					.setPlaceholder('5')
					.setValue(String(this.plugin.settings.maxConcurrentRequests))
					.onChange(async (value) => {
						const max = parseInt(value);
						if (!isNaN(max) && max > 0) {
							this.plugin.settings.maxConcurrentRequests = max;
							await this.plugin.saveSettings();
						}
					})
			);
	}
}
