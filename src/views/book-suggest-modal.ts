import { App, SuggestModal } from 'obsidian';
import type { Book } from '../models/book';

export class BookSuggestModal extends SuggestModal<Book> {
	private resolved = false;

	constructor(
		app: App,
		private results: Book[],
		private showCover: boolean,
		private callback: (book: Book | null) => void,
	) {
		super(app);
		this.setPlaceholder('Filter results...');
		this.limit = 25;
	}

	getSuggestions(query: string): Book[] {
		if (!query.trim()) return this.results;
		const q = query.toLowerCase();
		return this.results.filter((b) =>
			b.title?.toLowerCase().includes(q) ||
			b.author?.toLowerCase().includes(q) ||
			b.publisher?.toLowerCase().includes(q)
		);
	}

	renderSuggestion(book: Book, el: HTMLElement): void {
		el.addClass('book-suggestion-item');

		// Cover thumbnail (optional)
		if (this.showCover) {
			const coverUrl = book.coverMediumUrl || book.coverSmallUrl || book.coverLargeUrl || book.coverUrl;
			if (coverUrl) {
				el.createEl('img', {
					cls: 'book-suggestion-cover',
					attr: { src: coverUrl, loading: 'lazy', alt: book.title },
				});
			}
		}

		const textInfo = el.createDiv({ cls: 'book-suggestion-text-info' });
		textInfo.createEl('div', { text: book.title, cls: 'book-suggestion-title' });

		const subtitleParts: string[] = [];
		if (book.author) subtitleParts.push(book.author);
		if (book.publisher) subtitleParts.push(book.publisher);
		if (book.publishDate) subtitleParts.push(book.publishDate);
		if (book.totalPage) subtitleParts.push(`${book.totalPage}p`);
		if (subtitleParts.length) {
			textInfo.createEl('div', { text: subtitleParts.join(' · '), cls: 'book-suggestion-subtitle' });
		}
	}

	onChooseSuggestion(book: Book): void {
		this.resolved = true;
		this.callback(book);
	}

	onClose(): void {
		if (!this.resolved) {
			// Obsidian fires onClose BEFORE onChooseSuggestion on selection, so we must
			// defer the cancel-resolution to the next tick to give onChooseSuggestion
			// a chance to set `resolved` first. A real cancel (Esc) has no pending pick.
			window.setTimeout(() => {
				if (!this.resolved) this.callback(null);
			}, 0);
		}
	}
}
