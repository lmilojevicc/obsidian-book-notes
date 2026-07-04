import { MarkdownView, Notice, Plugin, TFile } from 'obsidian';
import { BookNotesSettings, DEFAULT_SETTINGS, BookNotesSettingTab } from './settings/settings';
import { factoryApi } from './apis/registry';
import type { BooksApi } from './apis/books-api';
import { BookSearchModal } from './views/book-search-modal';
import { BookSuggestModal } from './views/book-suggest-modal';
import { renderTemplate } from './utils/template';
import { makeFileName, sanitizeFileName } from './utils/filename';
import { downloadCover } from './utils/cover';
import { DEFAULT_TEMPLATE } from './constants';
import type { Book } from './models/book';

export default class BookNotesPlugin extends Plugin {
	settings!: BookNotesSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: 'create-book-note',
			name: 'Create new book note',
			callback: () => this.createNewBookNote(),
		});

		this.addCommand({
			id: 'insert-book-metadata',
			name: 'Insert book metadata',
			editorCallback: () => this.insertMetadata(),
		});

		this.addRibbonIcon('book', 'Create new book note', () => this.createNewBookNote());

		this.addSettingTab(new BookNotesSettingTab(this.app, this));
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	// --- Core flow ---

	private async searchAndPick(): Promise<Book | null> {
		const api = factoryApi(this.settings);
		let lastQuery = '';

		while (true) {
			// Run the search modal. Returns {books, query} on success, null if user
			// cancels at the search step (true abandon).
			const searchResult = await this.runSearchModal(api, lastQuery);
			if (!searchResult) return null;

			lastQuery = searchResult.query;
			const picked = await this.runSuggestModal(searchResult.books);
			if (picked) return picked; // chose a book → done
			// picked null → user Esc'd the picker → loop back to search modal
		}
	}

	private runSearchModal(api: BooksApi, initialQuery: string): Promise<{ books: Book[]; query: string } | null> {
		return new Promise((resolve) => {
			new BookSearchModal(this.app, api, initialQuery, (error, results, query) => {
				if (error || !results.length) { resolve(null); return; }
				resolve({ books: results, query });
			}).open();
		});
	}

	private runSuggestModal(books: Book[]): Promise<Book | null> {
		return new Promise<Book | null>((resolve) => {
			new BookSuggestModal(
				this.app,
				books,
				this.settings.showCoverImageInSearch,
				(book) => resolve(book),
			).open();
		});
	}

	private async getRenderedContent(book: Book): Promise<string> {
		// Optionally download cover
		if (this.settings.enableCoverImageSave) {
			const coverUrl = book.coverLargeUrl || book.coverMediumUrl || book.coverSmallUrl || book.coverUrl;
			if (coverUrl) {
				try {
					const slug = sanitizeFileName(book.title);
					const folder = this.settings.coverImagePath || this.settings.folder || '';
					const localPath = await downloadCover(this.app, coverUrl, slug, folder);
					if (localPath) book.localCoverImage = localPath;
				} catch (e) {
					console.warn('Book Notes: cover download failed', e);
					new Notice('Failed to download cover image. Using URL instead.');
				}
			}
		}

		// Read template
		let templateContent = DEFAULT_TEMPLATE;
		if (this.settings.templateFile) {
			const file = this.app.vault.getAbstractFileByPath(this.settings.templateFile);
			if (file instanceof TFile) {
				templateContent = await this.app.vault.read(file);
			}
		}

		return renderTemplate(templateContent, book);
	}

	async createNewBookNote() {
		try {
			const book = await this.searchAndPick();
			if (!book) return;

			const content = await this.getRenderedContent(book);
			const fileName = makeFileName(book, this.settings.fileNameFormat);
			const folder = this.settings.folder || '';

		// Ensure folder exists
		const folderPath = folder ? folder.replace(/^\/+|\/+$/g, '') : '';
		if (folderPath) {
			const existing = this.app.vault.getAbstractFileByPath(folderPath);
			if (!existing) {
				await this.app.vault.createFolder(folderPath);
			}
		}

		// Create file (dedup name on collision)
		const basePath = folderPath ? `${folderPath}/${fileName}.md` : `${fileName}.md`;
		let finalPath = basePath;
		let counter = 1;
		while (this.app.vault.getAbstractFileByPath(finalPath)) {
			finalPath = folderPath
				? `${folderPath}/${fileName}-${counter}.md`
				: `${fileName}-${counter}.md`;
			counter++;
		}

			const file = await this.app.vault.create(finalPath, content);

			if (this.settings.openPageOnCompletion) {
				await this.app.workspace.openLinkText(file.path, '', false);
			}

			new Notice(`Created ${file.name}`);
		} catch (err) {
			console.error('Book Notes: createNewBookNote failed', err);
			new Notice(`Book Notes error: ${(err as Error).message}`);
		}
	}

	async insertMetadata() {
		try {
			const book = await this.searchAndPick();
			if (!book) return;

			const content = await this.getRenderedContent(book);

			const view = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (view) {
				const editor = view.editor;
				editor.replaceRange(content, { line: 0, ch: 0 });
				new Notice('Book metadata inserted.');
			} else {
				new Notice('No active note to insert into.');
			}
		} catch (err) {
			console.error('Book Notes: insertMetadata failed', err);
			new Notice(`Book Notes error: ${(err as Error).message}`);
		}
	}
}
