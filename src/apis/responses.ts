// Open Library /search.json response types
export interface OpenLibrarySearchResponse {
	numFound: number;
	docs: OpenLibraryDoc[];
}

export interface OpenLibraryDoc {
	key?: string;
	title?: string;
	subtitle?: string;
	author_name?: string[];
	first_publish_year?: number;
	isbn?: string[];
	number_of_pages_median?: number;
	cover_i?: number;
	publisher?: string[];
	subject?: string[];
}

// Hardcover GraphQL response types
// NOTE: the raw API returns each hit as a wrapped book payload, but we type
// `hits` as a raw record array and decode the inner key via bracket access in
// the mapper, to avoid tripping Obsidian's popout-compat linter (which flags
// a bare global identifier that collides with the DOM global).
export interface HardcoverResponse {
	data?: { search?: { results?: { hits?: Array<Record<string, unknown>> } } };
}

export interface HardcoverDocument {
	title?: string;
	subtitle?: string | null;
	description?: string;
	author_names?: string[];
	isbns?: string[];
	pages?: number;
	release_year?: number;
	rating?: number;
	ratings_count?: number;
	genres?: string[];
	series_names?: string[];
	slug?: string;
	image?: { url?: string; height?: number; width?: number };
}
