import { VaultService } from '../../services/vault-service';
import { MCPPluginSettings } from '../../types/settings';
import { MCPError, PermissionDeniedError } from '../../utils/errors';
import {
	ToolResult,
	ReadNoteArgs,
	WriteNoteArgs,
	UpdateNoteArgs,
	DeleteNoteArgs,
	ListNotesArgs,
	SearchVaultArgs,
} from '../../types/mcp';

export class ToolHandler {
	constructor(
		private vaultService: VaultService,
		private settings: MCPPluginSettings
	) {}

	async handleToolCall(toolName: string, args: unknown): Promise<ToolResult> {
		try {
			switch (toolName) {
				case 'read_note':
					return await this.readNote(args as ReadNoteArgs);
				case 'write_note':
					return await this.writeNote(args as WriteNoteArgs);
				case 'update_note':
					return await this.updateNote(args as UpdateNoteArgs);
				case 'delete_note':
					return await this.deleteNote(args as DeleteNoteArgs);
				case 'list_notes':
					return await this.listNotes(args as ListNotesArgs);
				case 'search_vault':
					return await this.searchVault(args as SearchVaultArgs);
				default:
					throw new Error(`Unknown tool: ${toolName}`);
			}
		} catch (error) {
			if (error instanceof MCPError) {
				return {
					content: null,
					isError: true,
					errorMessage: error.message,
				};
			}
			return {
				content: null,
				isError: true,
				errorMessage: 'An unexpected error occurred',
			};
		}
	}

	private async readNote(args: ReadNoteArgs): Promise<ToolResult> {
		if (this.settings.requirePermissionForReads) {
			// Permission check would go here
		}

		if (!this.vaultService.validatePath(args.path)) {
			return {
				content: null,
				isError: true,
				errorMessage: `Invalid path: ${args.path}`,
			};
		}

		const content = await this.vaultService.readFile(args.path);
		return { content, isError: false };
	}

	private async writeNote(args: WriteNoteArgs): Promise<ToolResult> {
		if (!this.settings.enableWrite) {
			throw new PermissionDeniedError('write operations');
		}

		if (this.settings.requirePermissionForWrites) {
			// Permission check would go here
		}

		if (!this.vaultService.validatePath(args.path)) {
			return {
				content: null,
				isError: true,
				errorMessage: `Invalid path: ${args.path}`,
			};
		}

		await this.vaultService.writeFile(
			args.path,
			args.content,
			args.overwrite || false
		);
		return {
			content: { success: true, path: args.path },
			isError: false,
		};
	}

	private async updateNote(args: UpdateNoteArgs): Promise<ToolResult> {
		if (!this.settings.enableWrite) {
			throw new PermissionDeniedError('update operations');
		}

		if (this.settings.requirePermissionForWrites) {
			// Permission check would go here
		}

		if (!this.vaultService.validatePath(args.path)) {
			return {
				content: null,
				isError: true,
				errorMessage: `Invalid path: ${args.path}`,
			};
		}

		await this.vaultService.updateFile(args.path, args.content);
		return {
			content: { success: true, path: args.path },
			isError: false,
		};
	}

	private async deleteNote(args: DeleteNoteArgs): Promise<ToolResult> {
		if (!this.settings.enableDelete) {
			throw new PermissionDeniedError('delete operations');
		}

		if (this.settings.requirePermissionForWrites) {
			// Permission check would go here
		}

		if (!this.vaultService.validatePath(args.path)) {
			return {
				content: null,
				isError: true,
				errorMessage: `Invalid path: ${args.path}`,
			};
		}

		await this.vaultService.deleteFile(args.path);
		return {
			content: { success: true, path: args.path },
			isError: false,
		};
	}

	private async listNotes(args: ListNotesArgs): Promise<ToolResult> {
		const files = await this.vaultService.listFiles(args.folderPath || '');
		return { content: files, isError: false };
	}

	private async searchVault(args: SearchVaultArgs): Promise<ToolResult> {
		if (!this.settings.enableSearch) {
			throw new PermissionDeniedError('search operations');
		}

		const results = await this.vaultService.searchFiles(
			args.query,
			args.limit || 50
		);
		return { content: results, isError: false };
	}
}
