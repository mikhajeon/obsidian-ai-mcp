export interface MCPPluginSettings {
	// Server Configuration
	mcpServerEnabled: boolean;
	serverPort: number;
	transportType: 'websocket' | 'stdio';

	// Features
	enableCreate: boolean;
	enableUpdate: boolean;
	enableDelete: boolean;

	// Advanced
	logLevel: 'debug' | 'info' | 'warn' | 'error';
	maxConcurrentRequests: number;
}

export const DEFAULT_SETTINGS: MCPPluginSettings = {
	mcpServerEnabled: true,
	serverPort: 3010,
	transportType: 'websocket',
	enableCreate: true,
	enableUpdate: true,
	enableDelete: false,
	logLevel: 'info',
	maxConcurrentRequests: 5,
};
