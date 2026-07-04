import type { Book } from '../models/book';
import { replaceDateTokens } from './template';

export function sanitizeFileName(text: string): string {
	return text
		.replace(/[\\,#%&{}/*<>$":@.?|]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

export function makeFileName(book: Book, format: string): string {
	const template = format?.trim() || '{{title}} - {{author}}';

	// Resolve {{DATE}} / {{DATE:format}}
	let name = replaceDateTokens(template);

	// Resolve book fields
	const author = book.author || '';
	name = name.replace(/\{\{\s*title\s*\}\}/gi, () => book.title || '');
	name = name.replace(/\{\{\s*author\s*\}\}/gi, () => author);

	return sanitizeFileName(name);
}
