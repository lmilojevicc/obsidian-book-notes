import type { Book } from '../models/book';
import { moment } from 'obsidian';

export function sanitizeFileName(text: string): string {
	return text
		.replace(/[\\,#%&{}/*<>$":@.?|]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

export function makeFileName(book: Book, format: string): string {
	const template = format?.trim() || '{{title}} - {{author}}';

	// Resolve {{DATE}} / {{DATE:format}}
	let name = template.replace(/\{\{\s*DATE\s*(:([^}]+))?\s*\}\}/gi, (_match, _colon, fmt) => {
		return moment().format(fmt?.trim() || 'YYYY-MM-DD');
	});

	// Resolve book fields
	const author = book.author || '';
	name = name.replace(/\{\{\s*title\s*\}\}/gi, () => book.title || '');
	name = name.replace(/\{\{\s*author\s*\}\}/gi, () => author);

	return sanitizeFileName(name);
}
