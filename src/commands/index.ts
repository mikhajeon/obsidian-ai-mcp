import { Notice } from 'obsidian';
import MCPPlugin from '../main';

export function registerCommands(plugin: MCPPlugin) {
	plugin.addCommand({
		id: 'start-mcp-server',
		name: 'Start MCP Server',
		callback: async () => {
			await plugin.startMCPServer();
			new Notice('MCP Server started successfully');
		},
	});

	plugin.addCommand({
		id: 'stop-mcp-server',
		name: 'Stop MCP Server',
		callback: async () => {
			await plugin.stopMCPServer();
			new Notice('MCP Server stopped successfully');
		},
	});

	plugin.addCommand({
		id: 'mcp-server-status',
		name: 'MCP Server Status',
		callback: () => {
			const status = plugin.getMCPServerStatus();
			new Notice(`MCP Server Status: ${status}`);
		},
	});
}
