import type { Book } from '../models/book';
import type { BooksApi } from './books-api';
import { apiGet } from './books-api';
import { yamlBlockList } from '../utils/template';

const SEARCH_URL = 'https://openlibrary.org/search.json';
const FIELDS = 'key,title,subtitle,author_name,first_publish_year,isbn,number_of_pages_median,cover_i,publisher,subject';

export class OpenLibraryApi implements BooksApi {
	async getByQuery(query: string): Promise<Book[]> {
		const url = `${SEARCH_URL}?q=${encodeURIComponent(query)}&fields=${FIELDS}&limit=20`;
		const data = await apiGet(url);
		const docs: any[] = data.docs ?? [];
		return docs.map((doc) => this.mapBook(doc));
	}

	private mapBook(doc: any): Book {
		const authors: string[] = doc.author_name ?? [];
		const subjects: string[] = doc.subject ?? [];
		const isbns: string[] = doc.isbn ?? [];
		const isbn13 = isbns.find((i) => i.length === 13) ?? '';
		const isbn10 = isbns.find((i) => i.length === 10) ?? '';
		const coverId = doc.cover_i;

		return {
			title: doc.title ?? '',
			subtitle: doc.subtitle ?? '',
			author: authors.join(', '),
			authors,
			authorsLinked: authors.map((a) => `[[${a}]]`).join(', '),
			authorsList: yamlBlockList(authors),
			authorsLinkedList: yamlBlockList(authors.map((a) => `[[${a}]]`)),
			category: subjects.slice(0, 5).join(', '),
			categories: subjects.slice(0, 5),
			categoriesLinked: subjects.slice(0, 5).map((s) => `[[${s}]]`).join(', '),
			categoriesList: yamlBlockList(subjects.slice(0, 5)),
			categoriesLinkedList: yamlBlockList(subjects.slice(0, 5).map((s) => `[[${s}]]`)),
			publisher: doc.publisher?.[0] ?? '',
			publishDate: doc.first_publish_year ? String(doc.first_publish_year) : '',
			totalPage: doc.number_of_pages_median ?? undefined,
			coverLargeUrl: coverId ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` : undefined,
			coverMediumUrl: coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : undefined,
			coverSmallUrl: coverId ? `https://covers.openlibrary.org/b/id/${coverId}-S.jpg` : undefined,
			coverUrl: coverId ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` : undefined,
			coverOriginalUrl: coverId ? `https://covers.openlibrary.org/b/id/${coverId}.jpg` : undefined,
			isbn: isbn13 || isbn10,
			isbn10,
			isbn13,
			link: doc.key ? `https://openlibrary.org${doc.key}` : '',
		};
	}
}
