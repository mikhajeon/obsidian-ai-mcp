import { WebSocket, WebSocketServer } from 'ws';
import { ToolHandler } from './handlers/tools';
import { VaultService } from '../services/vault-service';
import { MCPPluginSettings } from '../types/settings';

interface MCPRequest {
	jsonrpc: '2.0';
	id: string | number;
	method: string;
	params?: unknown;
}

interface MCPResponse {
	jsonrpc: '2.0';
	id: string | number;
	result?: unknown;
	error?: {
		code: number;
		message: string;
	};
}

export class MCPServer {
	private wss: WebSocketServer | null = null;
	private toolHandler: ToolHandler;
	private clients: Set<WebSocket> = new Set();

	constructor(
		private vaultService: VaultService,
		private settings: MCPPluginSettings
	) {
		this.toolHandler = new ToolHandler(vaultService, settings);
	}

	async start(): Promise<void> {
		if (this.wss) {
			return;
		}

		try {
			this.wss = new WebSocketServer({ port: this.settings.serverPort });

			this.wss.on('error', (error: Error) => {
				console.error('WebSocketServer error:', error);
				throw error;
			});

			this.wss.on('connection', (ws: WebSocket) => {
				this.clients.add(ws);

				ws.on('message', async (data: Buffer) => {
					try {
						const requestStr = data.toString();
						const request = JSON.parse(requestStr) as MCPRequest;
						const response = await this.handleRequest(request);

						// Only send response if not a notification
						if (response !== null) {
							const responseStr = JSON.stringify(response);
							ws.send(responseStr);
						}
					} catch (error) {
						console.error('Error handling request:', error);
						console.error('Error stack:', error instanceof Error ? error.stack : '');
						const errorResponse: MCPResponse = {
							jsonrpc: '2.0',
							id: 0,
							error: {
								code: -32700,
								message: `Parse error: ${error}`,
							},
						};
						ws.send(JSON.stringify(errorResponse));
					}
				});

				ws.on('close', () => {
					this.clients.delete(ws);
				});

				ws.on('error', (error: Error) => {
					console.error('WebSocket client error:', error);
					this.clients.delete(ws);
				});
			});
		} catch (error) {
			console.error('Failed to create WebSocketServer:', error);
			this.wss = null;
			throw error;
		}
	}

	async stop(): Promise<void> {
		if (!this.wss) {
			return;
		}

		// Close all client connections
		for (const client of this.clients) {
			client.close();
		}
		this.clients.clear();

		// Close server
		await new Promise<void>((resolve) => {
			this.wss?.close(() => {
				resolve();
			});
		});

		this.wss = null;
	}

	private async handleRequest(request: MCPRequest): Promise<MCPResponse | null> {
		try {
			// Handle notifications (no response needed)
			if (request.method.startsWith('notifications/') || request.method === 'initialized') {
				return null; // Don't send response for notifications
			}

			// Handle MCP initialization
			if (request.method === 'initialize') {
				return {
					jsonrpc: '2.0',
					id: request.id,
					result: {
						protocolVersion: '2024-11-05',
						capabilities: {
							tools: {},
						},
						serverInfo: {
							name: 'obsidian-mcp-server',
							version: '1.0.0',
						},
					},
				};
			} else if (request.method === 'tools/list') {
				const tools = this.getAvailableTools();
				return {
					jsonrpc: '2.0',
					id: request.id,
					result: { tools },
				};
			} else if (request.method === 'tools/call') {
				const params = request.params as { name: string; arguments: unknown };
				const result = await this.toolHandler.handleToolCall(
					params.name,
					params.arguments
				);

				if (result.isError) {
					return {
						jsonrpc: '2.0',
						id: request.id,
						error: {
							code: -32000,
							message: result.errorMessage || 'Unknown error',
						},
					};
				}

				return {
					jsonrpc: '2.0',
					id: request.id,
					result: {
						content: [
							{
								type: 'text',
								text: JSON.stringify(result.content, null, 2),
							},
						],
					},
				};
			} else if (request.method === 'ping') {
				return {
					jsonrpc: '2.0',
					id: request.id,
					result: {},
				};
			} else {
				// Unsupported method
				return {
					jsonrpc: '2.0',
					id: request.id || 0,
					error: {
						code: -32601,
						message: `Method not found: ${request.method}`,
					},
				};
			}
		} catch (error) {
			return {
				jsonrpc: '2.0',
				id: (request && request.id) || 0,
				error: {
					code: -32603,
					message: `Internal error: ${error}`,
				},
			};
		}
	}

	private getAvailableTools() {
		return [
			{
				name: 'read_note',
				description: 'Read the content of a note from the Obsidian vault',
				inputSchema: {
					type: 'object',
					properties: {
						path: {
							type: 'string',
							description: 'Path to the note (e.g., "folder/note.md")',
						},
					},
					required: ['path'],
				},
			},
			{
				name: 'write_note',
				description: 'Write content to a new note in the Obsidian vault',
				inputSchema: {
					type: 'object',
					properties: {
						path: {
							type: 'string',
							description: 'Path where the note should be created',
						},
						content: {
							type: 'string',
							description: 'Content to write to the note',
						},
						overwrite: {
							type: 'boolean',
							description: 'Whether to overwrite if file exists',
							default: false,
						},
					},
					required: ['path', 'content'],
				},
			},
			{
				name: 'update_note',
				description: 'Update an existing note in the Obsidian vault',
				inputSchema: {
					type: 'object',
					properties: {
						path: {
							type: 'string',
							description: 'Path to the note to update',
						},
						content: {
							type: 'string',
							description: 'New content for the note',
						},
					},
					required: ['path', 'content'],
				},
			},
			{
				name: 'delete_note',
				description: 'Delete a note from the Obsidian vault',
				inputSchema: {
					type: 'object',
					properties: {
						path: {
							type: 'string',
							description: 'Path to the note to delete',
						},
					},
					required: ['path'],
				},
			},
			{
				name: 'list_notes',
				description: 'List all notes in the Obsidian vault or a specific folder',
				inputSchema: {
					type: 'object',
					properties: {
						folderPath: {
							type: 'string',
							description: 'Optional folder path to list notes from',
						},
					},
				},
			},
			{
				name: 'search_vault',
				description: 'Search for notes containing specific text in the vault',
				inputSchema: {
					type: 'object',
					properties: {
						query: {
							type: 'string',
							description: 'Search query',
						},
						limit: {
							type: 'number',
							description: 'Maximum number of results',
							default: 50,
						},
					},
					required: ['query'],
				},
			},
		];
	}
}
