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

		const header = containerEl.createEl('h2', { text: 'AI MCP Settings' });
		header.style.fontSize = '1.5em';

		new Setting(containerEl)
			.setName('Auto-start MCP Server')
			.setDesc('Automatically start the MCP server when Obsidian launches')
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.mcpServerEnabled)
					.onChange(async (value) => {
						this.plugin.settings.mcpServerEnabled = value;
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

		// Available Commands Section (subtle guide)
		const commandsSection = containerEl.createDiv();
		commandsSection.style.marginTop = '10px';
		commandsSection.style.paddingTop = '15px';
		commandsSection.style.borderTop = '1px solid var(--background-modifier-border)';
		commandsSection.style.opacity = '0.6';
		commandsSection.style.fontSize = '0.9em';

		const commandsHeader = commandsSection.createEl('div');
		commandsHeader.style.marginBottom = '8px';
		commandsHeader.style.fontWeight = '500';
		commandsHeader.style.fontSize = '0.95em';
		commandsHeader.setText('Available Commands');

		const commandsDesc = commandsSection.createDiv();
		commandsDesc.style.marginBottom = '8px';
		commandsDesc.style.fontSize = '0.85em';
		commandsDesc.setText('Access via Command Palette (Ctrl/Cmd + P):');

		const commandsList = commandsSection.createEl('ul');
		commandsList.style.marginLeft = '20px';
		commandsList.style.fontSize = '0.85em';
		commandsList.style.listStyleType = 'none';

		const commands = [
			{
				name: 'Start MCP Server',
				desc: 'Manually start the server',
			},
			{
				name: 'Stop MCP Server',
				desc: 'Stop the running server',
			},
			{
				name: 'MCP Server Status',
				desc: 'Check server status',
			},
		];

		commands.forEach((cmd) => {
			const li = commandsList.createEl('li');
			li.style.marginBottom = '4px';
			li.setText(`• ${cmd.name} - ${cmd.desc}`);
		});
	}
}
