import { App, ButtonComponent, Modal, Notice, Setting, TextComponent } from 'obsidian';
import type { Book } from '../models/book';
import type { BooksApi } from '../apis/books-api';

export class BookSearchModal extends Modal {
	private resolved = false;
	private busy = false;

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

		let searchBtn: ButtonComponent | null = null;
		new Setting(contentEl)
			.addButton((btn) => {
				searchBtn = btn;
				btn.setButtonText('Search').setCta().onClick(() => {
					void this.search(input.getValue(), searchBtn);
				});
			});

		input.inputEl.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' && !e.isComposing) {
				e.preventDefault();
				void this.search(input.getValue(), searchBtn);
			}
		});
	}

	private setBusy(btn: ButtonComponent | null, busy: boolean): void {
		if (!btn) return;
		btn.setButtonText(busy ? 'Searching...' : 'Search');
		btn.setDisabled(busy);
	}

	private async search(query: string, btn: ButtonComponent | null): Promise<void> {
		if (!query.trim() || this.busy) return;
		this.busy = true;
		this.setBusy(btn, true);
		try {
			const results = await this.api.getByQuery(query.trim());
			if (!results?.length) {
				new Notice(`No results found for "${query}"`);
				return;
			}
			this.resolved = true;
			this.callback(null, results);
			this.close();
		} catch (err) {
			new Notice(`Search failed: ${(err as Error).message}`);
			this.resolved = true;
			this.callback(err as Error, []);
		} finally {
			this.busy = false;
			this.setBusy(btn, false);
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
