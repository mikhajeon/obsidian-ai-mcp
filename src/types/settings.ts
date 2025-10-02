export interface MCPPluginSettings {
	// Server Configuration
	mcpServerEnabled: boolean;
	serverPort: number;
	transportType: 'websocket' | 'stdio';

	// Security & Permissions
	requirePermissionForReads: boolean;
	requirePermissionForWrites: boolean;
	allowedPaths: string[];
	blockedPaths: string[];

	// Features
	enableSearch: boolean;
	enableMetadata: boolean;
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
	requirePermissionForReads: false,
	requirePermissionForWrites: true,
	allowedPaths: [],
	blockedPaths: [],
	enableSearch: true,
	enableMetadata: true,
	enableWrite: true,
	enableDelete: false,
	logLevel: 'info',
	maxConcurrentRequests: 5,
};
