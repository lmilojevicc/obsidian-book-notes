import assert from 'assert';

// Faithful JS copies of mapOpenLibraryDoc / mapHardcoverDocument (mirrors the
// extracted pure functions in src/apis/openlibrary-api.ts and
// src/apis/hardcover-api.ts). Tested in isolation because the .ts files import
// from 'obsidian' transitively (via yamlBlockList → template.ts → moment).

function yamlBlockList(items) {
	return items.length ? '\n' + items.map((i) => `  - ${i}`).join('\n') : '';
}

function mapOpenLibraryDoc(doc) {
	const authors = doc.author_name ?? [];
	const subjects = doc.subject ?? [];
	const isbns = doc.isbn ?? [];
	const isbn13 = isbns.find((i) => i.length === 13) ?? '';
	const isbn10 = isbns.find((i) => i.length === 10) ?? '';
	const coverId = doc.cover_i;

	return {
		title: doc.title ?? '',
		subtitle: doc.subtitle ?? '',
		author: authors.join(', '),
		authors,
		authorsList: yamlBlockList(authors),
		authorsLinkedList: yamlBlockList(authors.map((a) => `"[[${a}]]"`)),
		category: subjects.slice(0, 5).join(', '),
		categories: subjects.slice(0, 5),
		categoriesList: yamlBlockList(subjects.slice(0, 5)),
		categoriesLinkedList: yamlBlockList(subjects.slice(0, 5).map((s) => `"[[${s}]]"`)),
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

function mapHardcoverDocument(book) {
	const authors = book.author_names ?? [];
	const isbns = book.isbns ?? [];
	const isbn13 = isbns.find((i) => i.length === 13) ?? '';
	const isbn10 = isbns.find((i) => i.length === 10) ?? '';
	const genres = book.genres ?? [];
	const coverUrl = book.image?.url ?? '';

	return {
		title: book.title ?? '',
		subtitle: book.subtitle ?? '',
		description: book.description ?? '',
		author: authors.join(', '),
		authors,
		authorsList: yamlBlockList(authors),
		authorsLinkedList: yamlBlockList(authors.map((a) => `"[[${a}]]"`)),
		publisher: '',
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
		seriesLinkedList: yamlBlockList((book.series_names ?? []).map((s) => `"[[${s}]]"`)),
		link: book.slug ? `https://hardcover.app/books/${book.slug}` : '',
	};
}

// --- Open Library: real captured Dune doc ---
{
	const doc = {
		key: '/works/OL893415W',
		title: 'Dune',
		author_name: ['Frank Herbert'],
		first_publish_year: 1965,
		number_of_pages_median: 704,
		cover_i: 11481354,
		isbn: ['9780441013593', '0441013597'],
		publisher: ['Ace Books'],
		subject: ['Fiction', 'Science fiction', 'Fantasy fiction'],
	};
	const b = mapOpenLibraryDoc(doc);
	assert.strictEqual(b.title, 'Dune');
	assert.strictEqual(b.author, 'Frank Herbert');
	assert.deepStrictEqual(b.authors, ['Frank Herbert']);
	assert.strictEqual(b.publishDate, '1965');
	assert.strictEqual(b.totalPage, 704);
	assert.strictEqual(b.isbn13, '9780441013593');
	assert.strictEqual(b.isbn10, '0441013597');
	assert.strictEqual(b.isbn, '9780441013593');
	assert.ok(b.coverUrl?.startsWith('https://covers.openlibrary.org/b/id/11481354-'), `coverUrl was: ${b.coverUrl}`);
	assert.strictEqual(b.coverOriginalUrl, 'https://covers.openlibrary.org/b/id/11481354.jpg');
	assert.strictEqual(b.link, 'https://openlibrary.org/works/OL893415W');
	assert.strictEqual(b.publisher, 'Ace Books');
	assert.strictEqual(b.categories.length, 3);
	assert.ok(b.categoriesList?.startsWith('\n  - '));
	assert.ok(b.categoriesList?.includes('Fiction'));
	assert.ok(b.categoriesLinkedList?.includes('"[[Fiction]]"'), `categoriesLinkedList: ${b.categoriesLinkedList}`);
	assert.strictEqual(b.authorsLinkedList, '\n  - "[[Frank Herbert]]"');
}

// --- Open Library: empty doc (no crash) ---
{
	const b = mapOpenLibraryDoc({});
	assert.strictEqual(b.title, '');
	assert.deepStrictEqual(b.authors, []);
	assert.strictEqual(b.publishDate, '');
	assert.strictEqual(b.coverUrl, undefined);
	assert.strictEqual(b.coverOriginalUrl, undefined);
	assert.strictEqual(b.isbn, '');
	assert.strictEqual(b.link, '');
	assert.strictEqual(b.authorsList, '');
	assert.strictEqual(b.authorsLinkedList, '');
}

// --- Open Library: missing cover_i ---
{
	const b = mapOpenLibraryDoc({ title: 'No Cover', author_name: ['X'] });
	assert.strictEqual(b.coverUrl, undefined);
	assert.strictEqual(b.coverLargeUrl, undefined);
	assert.strictEqual(b.coverOriginalUrl, undefined);
	assert.strictEqual(b.title, 'No Cover');
}

// --- Open Library: subjects capped at 5 ---
{
	const b = mapOpenLibraryDoc({ subject: ['a', 'b', 'c', 'd', 'e', 'f', 'g'] });
	assert.strictEqual(b.categories.length, 5);
	assert.strictEqual(b.category, 'a, b, c, d, e');
}

// --- Hardcover: real captured Dune document ---
{
	const doc = {
		title: 'Dune',
		subtitle: null,
		description: 'Set on the desert planet Arrakis...',
		author_names: ['Frank Herbert', 'Brian Herbert'],
		isbns: ['9780441013593', '0441013597', '9780425071601', '042507160X'],
		pages: 704,
		release_year: 1965,
		rating: 4.32,
		ratings_count: 5695,
		genres: ['Science Fiction', 'Fiction', 'Fantasy'],
		series_names: ['Dune', 'Dune Universe'],
		slug: 'dune',
		image: { url: 'https://assets.hardcover.app/editions/x.jpg', height: 500, width: 333 },
	};
	const b = mapHardcoverDocument(doc);
	assert.strictEqual(b.title, 'Dune');
	assert.strictEqual(b.subtitle, ''); // fixture subtitle is null → ''
	assert.strictEqual(b.author, 'Frank Herbert, Brian Herbert');
	assert.strictEqual(b.authors.length, 2);
	assert.strictEqual(b.publishDate, '1965');
	assert.strictEqual(b.totalPage, 704);
	assert.strictEqual(b.isbn13, '9780441013593');
	assert.strictEqual(b.isbn10, '0441013597');
	assert.strictEqual(b.rating, 4.32);
	assert.strictEqual(b.ratingsCount, 5695);
	assert.strictEqual(b.categories.length, 3); // categories mirrors genres
	assert.strictEqual(b.series.length, 2);
	assert.strictEqual(b.coverUrl, 'https://assets.hardcover.app/editions/x.jpg');
	assert.strictEqual(b.coverOriginalUrl, 'https://assets.hardcover.app/editions/x.jpg');
	assert.strictEqual(b.link, 'https://hardcover.app/books/dune');
	assert.strictEqual(b.description, 'Set on the desert planet Arrakis...');
	assert.strictEqual(b.publisher, '');
	assert.strictEqual(b.authorsLinkedList, '\n  - "[[Frank Herbert]]"\n  - "[[Brian Herbert]]"');
	assert.strictEqual(b.genresList, '\n  - Science Fiction\n  - Fiction\n  - Fantasy');
	assert.strictEqual(b.genresLinkedList, '\n  - "[[Science Fiction]]"\n  - "[[Fiction]]"\n  - "[[Fantasy]]"');
	assert.strictEqual(b.seriesLinkedList, '\n  - "[[Dune]]"\n  - "[[Dune Universe]]"');
}

// --- Hardcover: empty doc (no crash) ---
{
	const b = mapHardcoverDocument({});
	assert.strictEqual(b.title, '');
	assert.deepStrictEqual(b.authors, []);
	assert.deepStrictEqual(b.categories, []);
	assert.deepStrictEqual(b.series, []);
	assert.strictEqual(b.coverUrl, undefined);
	assert.strictEqual(b.rating, undefined);
	assert.strictEqual(b.authorsLinkedList, '');
	assert.strictEqual(b.genresList, '');
}

// --- Hardcover: null subtitle/description handled (?? '' coerces null to '') ---
{
	const b = mapHardcoverDocument({ title: 'X', subtitle: null, description: null });
	assert.strictEqual(b.subtitle, '');
	assert.strictEqual(b.description, '');
}

console.log('✓ All API mapper tests passed');
