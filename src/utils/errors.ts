export class MCPError extends Error {
	constructor(message: string, public code: string) {
		super(message);
		this.name = 'MCPError';
	}
}

export class FileNotFoundError extends MCPError {
	constructor(path: string) {
		super(`File not found: ${path}`, 'FILE_NOT_FOUND');
	}
}

export class PermissionDeniedError extends MCPError {
	constructor(operation: string) {
		super(`Permission denied: ${operation}`, 'PERMISSION_DENIED');
	}
}

export class InvalidPathError extends MCPError {
	constructor(path: string) {
		super(`Invalid path: ${path}`, 'INVALID_PATH');
	}
}

export class FileAlreadyExistsError extends MCPError {
	constructor(path: string) {
		super(`File already exists: ${path}`, 'FILE_EXISTS');
	}
}
