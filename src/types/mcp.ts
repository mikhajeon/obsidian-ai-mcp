export interface ToolResult {
	content: unknown;
	isError: boolean;
	errorMessage?: string;
}

export interface ReadNoteArgs {
	path: string;
}

export interface WriteNoteArgs {
	path: string;
	content: string;
	overwrite?: boolean;
}

export interface UpdateNoteArgs {
	path: string;
	content: string;
}

export interface DeleteNoteArgs {
	path: string;
}

export interface ListNotesArgs {
	folderPath?: string;
}

export interface SearchVaultArgs {
	query: string;
	limit?: number;
}

export type ToolArgs =
	| ReadNoteArgs
	| WriteNoteArgs
	| UpdateNoteArgs
	| DeleteNoteArgs
	| ListNotesArgs
	| SearchVaultArgs;
