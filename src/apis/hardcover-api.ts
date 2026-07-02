import type { Book } from '../models/book';
import type { BooksApi } from './books-api';
import { apiPost } from './books-api';
import { yamlBlockList } from '../utils/template';

const ENDPOINT = 'https://api.hardcover.app/v1/graphql';

export class HardcoverApi implements BooksApi {
	constructor(private token: string) {}

	async getByQuery(query: string): Promise<Book[]> {
		const gqlQuery = `query SearchBooks($query: String!) {
			search(query: $query, query_type: "Book", per_page: 20, page: 1) {
				results
			}
		}`;
		const body = JSON.stringify({ query: gqlQuery, variables: { query } });
		const data = await apiPost(ENDPOINT, body, { Authorization: `Bearer ${this.token}` });
		const results = data?.data?.search?.results;
		const hits: any[] = results?.hits ?? [];
		return hits.map((hit) => this.mapBook(hit?.document ?? hit));
	}

	private mapBook(book: any): Book {
		const authors: string[] = book.author_names ?? [];
		const isbns: string[] = book.isbns ?? [];
		const isbn13 = isbns.find((i: string) => i.length === 13) ?? '';
		const isbn10 = isbns.find((i: string) => i.length === 10) ?? '';
		const genres: string[] = book.genres ?? [];
		const coverUrl = book.image?.url ?? '';

		return {
			title: book.title ?? '',
			subtitle: book.subtitle ?? '',
			description: book.description ?? '',
			author: authors.join(', '),
			authors,
			authorsList: yamlBlockList(authors),
			authorsLinkedList: yamlBlockList(authors.map((a) => `"[[${a}]]"`)),
			publisher: '',  // publisher is on edition, not search results
			publishDate: book.release_year ? String(book.release_year) : '',
			totalPage: book.pages ?? undefined,
			coverLargeUrl: coverUrl || undefined,
			coverUrl: coverUrl || undefined,
			coverOriginalUrl: coverUrl || undefined,
			isbn: isbn13 || isbn10,
			isbn10,
			isbn13,
			rating: book.rating ?? undefined,
			ratingsCount: book.ratings_count ?? undefined,
			categories: genres,
			category: genres.join(', '),
			categoriesList: yamlBlockList(genres),
			categoriesLinkedList: yamlBlockList(genres.map((g) => `"[[${g}]]"`)),
			genresList: yamlBlockList(genres),
			genresLinkedList: yamlBlockList(genres.map((g) => `"[[${g}]]"`)),
			series: book.series_names ?? [],
			seriesList: yamlBlockList(book.series_names ?? []),
			seriesLinkedList: yamlBlockList((book.series_names ?? []).map((s: string) => `"[[${s}]]"`)),
			link: book.slug ? `https://hardcover.app/books/${book.slug}` : '',
		};
	}
}
