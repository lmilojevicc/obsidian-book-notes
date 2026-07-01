import { requestUrl } from 'obsidian';
import type { Book } from '../models/book';
import type { BookNotesSettings } from '../settings/settings';
import { OpenLibraryApi } from './openlibrary-api';
import { HardcoverApi } from './hardcover-api';

export interface BooksApi {
	getByQuery(query: string): Promise<Book[]>;
}

export async function apiGet(url: string): Promise<any> {
	const res = await requestUrl({ url, method: 'GET', throw: true });
	return res.json;
}

export async function apiPost(url: string, body: string, headers: Record<string, string>): Promise<any> {
	const res = await requestUrl({
		url, method: 'POST', contentType: 'application/json',
		headers, body, throw: true,
	});
	return res.json;
}

export function factoryApi(settings: BookNotesSettings): BooksApi {
	switch (settings.serviceProvider) {
		case 'openlibrary':
			return new OpenLibraryApi();
		case 'hardcover':
			if (!settings.hardcoverToken) {
				throw new Error('Hardcover API token is required. Set it in plugin settings.');
			}
			return new HardcoverApi(settings.hardcoverToken);
		default:
			return new OpenLibraryApi();
	}
}
