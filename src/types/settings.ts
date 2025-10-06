export interface MCPPluginSettings {
	// Server Configuration
	mcpServerEnabled: boolean;
	serverPort: number;
	transportType: 'websocket' | 'stdio';

	// Features
	enableWrite: boolean;
	enableDelete: boolean;

	// Advanced
	logLevel: 'debug' | 'info' | 'warn' | 'error';
	maxConcurrentRequests: number;
}

export const DEFAULT_SETTINGS: MCPPluginSettings = {
	mcpServerEnabled: false,
	serverPort: 3010,
	transportType: 'websocket',
	enableWrite: true,
	enableDelete: false,
	logLevel: 'info',
	maxConcurrentRequests: 5,
};
