import { App, TFile, TFolder, TAbstractFile } from 'obsidian';
import { FileNotFoundError, InvalidPathError, FileAlreadyExistsError } from '../utils/errors';

export interface SearchResult {
	path: string;
	content: string;
	score: number;
}

export interface FileInfo {
	path: string;
	name: string;
	extension: string;
	size: number;
	created: number;
	modified: number;
}

export class VaultService {
	constructor(private app: App) {}

	async readFile(path: string): Promise<string> {
		const file = this.app.vault.getAbstractFileByPath(path);
		if (!file || !(file instanceof TFile)) {
			throw new FileNotFoundError(path);
		}
		return await this.app.vault.read(file);
	}

	async writeFile(path: string, content: string, overwrite = false): Promise<void> {
		const existingFile = this.app.vault.getAbstractFileByPath(path);

		if (existingFile && !overwrite) {
			throw new FileAlreadyExistsError(path);
		}

		if (existingFile && existingFile instanceof TFile) {
			await this.app.vault.modify(existingFile, content);
		} else {
			await this.app.vault.create(path, content);
		}
	}

	async updateFile(path: string, content: string): Promise<void> {
		const file = this.app.vault.getAbstractFileByPath(path);
		if (!file || !(file instanceof TFile)) {
			throw new FileNotFoundError(path);
		}
		await this.app.vault.modify(file, content);
	}

	async deleteFile(path: string): Promise<void> {
		const file = this.app.vault.getAbstractFileByPath(path);
		if (!file || !(file instanceof TFile)) {
			throw new FileNotFoundError(path);
		}
		await this.app.vault.delete(file);
	}

	async listFiles(folderPath = ''): Promise<FileInfo[]> {
		const files: FileInfo[] = [];
		const folder = folderPath
			? this.app.vault.getAbstractFileByPath(folderPath)
			: this.app.vault.getRoot();

		if (!folder || !(folder instanceof TFolder)) {
			throw new InvalidPathError(folderPath);
		}

		const processFolder = (currentFolder: TFolder) => {
			for (const child of currentFolder.children) {
				if (child instanceof TFile) {
					files.push({
						path: child.path,
						name: child.name,
						extension: child.extension,
						size: child.stat.size,
						created: child.stat.ctime,
						modified: child.stat.mtime,
					});
				} else if (child instanceof TFolder) {
					processFolder(child);
				}
			}
		};

		processFolder(folder);
		return files;
	}

	async searchFiles(query: string, limit = 50): Promise<SearchResult[]> {
		const results: SearchResult[] = [];
		const files = this.app.vault.getMarkdownFiles();

		for (const file of files) {
			const content = await this.app.vault.read(file);
			const lowerContent = content.toLowerCase();
			const lowerQuery = query.toLowerCase();

			if (lowerContent.includes(lowerQuery)) {
				const index = lowerContent.indexOf(lowerQuery);
				const start = Math.max(0, index - 50);
				const end = Math.min(content.length, index + query.length + 50);
				const snippet = content.substring(start, end);

				results.push({
					path: file.path,
					content: snippet,
					score: this.calculateScore(content, query),
				});
			}

			if (results.length >= limit) {
				break;
			}
		}

		return results.sort((a, b) => b.score - a.score);
	}

	private calculateScore(content: string, query: string): number {
		const lowerContent = content.toLowerCase();
		const lowerQuery = query.toLowerCase();
		const occurrences = (lowerContent.match(new RegExp(lowerQuery, 'g')) || []).length;
		return occurrences;
	}

	validatePath(path: string): boolean {
		// Prevent directory traversal
		if (path.includes('..')) {
			return false;
		}
		// Ensure it's a valid markdown file
		if (!path.endsWith('.md')) {
			return false;
		}
		return true;
	}
}
