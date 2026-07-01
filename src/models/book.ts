export interface Book {
	// Core identity
	title: string;
	subtitle?: string;

	// Authors
	author: string;       // comma-joined string for easy templating
	authors: string[];    // array form

	// Classification
	category?: string;       // comma-joined
	categories?: string[];   // array form

	// Publication
	publisher?: string;
	publishDate?: string;    // year or full date depending on API
	totalPage?: number;

	// Covers (remote URLs)
	coverUrl?: string;
	coverSmallUrl?: string;
	coverMediumUrl?: string;
	coverLargeUrl?: string;

	// Cover (local — set when enableCoverImageSave is on)
	localCoverImage?: string;

	// Identifiers
	isbn?: string;
	isbn10?: string;
	isbn13?: string;
	asin?: string;           // Hardcover only

	// Links
	link?: string;
	description?: string;

	// Hardcover enrichment
	rating?: number;
	ratingsCount?: number;
	genres?: string[];
	series?: string[];

	// User-editable status fields (never populated by API; for user templates)
	status?: string;
}
