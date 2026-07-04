import { requestUrl } from 'obsidian';
import type { Book } from '../models/book';

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
