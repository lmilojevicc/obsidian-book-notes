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
export interface HardcoverResponse {
	data?: { search?: { results?: { hits?: HardcoverHit[] } } };
}

export interface HardcoverHit {
	document?: HardcoverDocument;
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
