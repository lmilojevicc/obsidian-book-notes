export interface Book {
	// Core identity
	title: string;
	subtitle?: string;

	// Authors
	author: string;       // comma-joined string for easy templating
	authors: string[];    // array form
	authorsLinked?: string; // pre-formatted wikilinks, e.g. "[[Author A]], [[Author B]]"
	authorsList?: string; // YAML block list, e.g. "\n  - Author A\n  - Author B"
	authorsLinkedList?: string; // YAML block list of wikilinks

	// Classification
	category?: string;        // comma-joined
	categories?: string[];    // array form
	categoriesLinked?: string; // pre-formatted wikilinks, e.g. "[[Fiction]], [[Fantasy]]"
	categoriesList?: string; // YAML block list
	categoriesLinkedList?: string; // YAML block list of wikilinks

	// Publication
	publisher?: string;
	publishDate?: string;    // year or full date depending on API
	totalPage?: number;

	// Covers (remote URLs)
	coverUrl?: string;
	coverSmallUrl?: string;
	coverMediumUrl?: string;
	coverLargeUrl?: string;
	coverOriginalUrl?: string; // full-resolution original (Open Library: no size suffix); ideal for banners

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
	genresLinked?: string; // pre-formatted wikilinks
	genresList?: string; // YAML block list
	genresLinkedList?: string; // YAML block list of wikilinks
	series?: string[];
	seriesLinked?: string; // pre-formatted wikilinks
	seriesList?: string; // YAML block list
	seriesLinkedList?: string; // YAML block list of wikilinks

	// User-editable status fields (never populated by API; for user templates)
	status?: string;
}
