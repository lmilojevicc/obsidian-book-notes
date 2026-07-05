import type { Book } from '../models/book';
import { moment } from 'obsidian';

/**
 * Format an array of strings as a YAML block list string.
 * Empty array → '' (renders as `key:` = valid YAML null).
 * Non-empty → leading '\n' then '  - item' per line.
 * Use in templates as `key:{{fieldName}}` (NO space after the colon) so the
 * leading newline forms the indented list.
 */
export function yamlBlockList(items: string[]): string {
	return items.length ? '\n' + items.map((i) => `  - ${i}`).join('\n') : '';
}

/**
 * Replace {{DATE}} and {{DATE:format}} tokens with the current date.
 * Uses matchAll + manual rebuild so all capture-group values are fully typed
 * (avoids String.replace's loose callback param typing).
 */
export function replaceDateTokens(text: string): string {
	const regex = /\{\{\s*DATE\s*(:([^}]+))?\s*\}\}/gi;
	let result = '';
	let lastIndex = 0;
	for (const m of text.matchAll(regex)) {
		const start = m.index ?? 0;
		const matched = m[0] ?? '';
		result += text.slice(lastIndex, start);
		const formatGroup: string | undefined = m[2];
		const format = (formatGroup ?? '').trim() || 'YYYY-MM-DD';
		result += moment().format(format);
		lastIndex = start + matched.length;
	}
	return result + text.slice(lastIndex);
}

/**
 * Render a template string by replacing {{var}} tokens.
 * Pass 1: {{DATE}} and {{DATE:format}} date tokens.
 * Pass 2: every Book field → {{fieldName}}. Arrays joined with ', '.
 * Unknown tokens → empty string.
 */
export function renderTemplate(text: string, book: Book): string {
	if (!text?.trim()) return '';

	// Pass 1: Date tokens — {{DATE}} or {{DATE:YYYY-MM-DD}}
	let result = replaceDateTokens(text);

	// Pass 2: Book fields
	const entries = Object.entries(book) as [string, unknown][];
	for (const [key, val] of entries) {
		let replacement = '';
		if (Array.isArray(val)) {
			replacement = val.join(', ');
		} else if (typeof val === 'string') {
			replacement = val;
		} else if (typeof val === 'number' || typeof val === 'boolean') {
			replacement = String(val);
		}
		result = result.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'ig'), () => replacement);
	}

	// Strip unknown {{tokens}}
	result = result.replace(/\{\{\s*\w+\s*\}\}/gi, '');

	return result;
}
