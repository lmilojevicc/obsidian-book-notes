import type { Book } from '../models/book';
import { moment } from 'obsidian';

/**
 * Render a template string by replacing {{var}} tokens.
 * Pass 1: {{DATE}} and {{DATE:format}} date tokens.
 * Pass 2: every Book field → {{fieldName}}. Arrays joined with ', '.
 * Unknown tokens → empty string.
 */
export function renderTemplate(text: string, book: Book): string {
	if (!text?.trim()) return '';

	// Pass 1: Date tokens — {{DATE}} or {{DATE:YYYY-MM-DD}}
	let result = text.replace(/\{\{\s*DATE\s*(:([^}]+))?\s*\}\}/gi, (_, _colon, format) => {
		return moment().format(format?.trim() || 'YYYY-MM-DD');
	});

	// Pass 2: Book fields
	const entries = Object.entries(book) as [string, unknown][];
	for (const [key, val] of entries) {
		let replacement = '';
		if (Array.isArray(val)) {
			replacement = val.join(', ');
		} else if (val != null) {
			replacement = String(val);
		}
		result = result.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'ig'), () => replacement);
	}

	// Strip unknown {{tokens}}
	result = result.replace(/\{\{\s*\w+\s*\}\}/gi, '');

	return result;
}
