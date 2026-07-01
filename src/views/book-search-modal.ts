import { App, Modal, Notice, Setting, TextComponent } from 'obsidian';
import type { Book } from '../models/book';
import type { BooksApi } from '../apis/books-api';

export class BookSearchModal extends Modal {
	private resolved = false;

	constructor(
		app: App,
		private api: BooksApi,
		private callback: (error: Error | null, results: Book[]) => void,
	) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;

		this.setTitle('Search Book');
		contentEl.addClass('book-search-modal');

		const input = new TextComponent(contentEl)
			.setPlaceholder('Search by title, author, or ISBN');
		input.inputEl.addClass('book-search-input');

		input.inputEl.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' && !e.isComposing) {
				e.preventDefault();
				void this.search(input.getValue());
			}
		});

		new Setting(contentEl)
			.addButton((btn) =>
				btn.setButtonText('Search').setCta().onClick(() => {
					void this.search(input.getValue());
				}));
	}

	private async search(query: string): Promise<void> {
		if (!query.trim()) return;
		try {
			const results = await this.api.getByQuery(query.trim());
			if (!results?.length) {
				new Notice(`No results found for "${query}"`);
				return;
			}
			this.close();
			this.resolved = true;
			this.callback(null, results);
		} catch (err) {
			new Notice(`Search failed: ${(err as Error).message}`);
			this.resolved = true;
			this.callback(err as Error, []);
		}
	}

	onClose() {
		if (!this.resolved) {
			this.resolved = true;
			this.callback(null, []);
		}
		this.contentEl.empty();
	}
}
