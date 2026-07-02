# Book Notes

An [Obsidian](https://obsidian.md) plugin to search for books (via Open Library or Hardcover) and create templated notes with interpolated metadata. A re-implementation of [obsidian-book-search-plugin](https://github.com/anpigon/obsidian-book-search-plugin)'s UX using more reliable backends.

## Installation

1. Copy `main.js`, `manifest.json`, and `styles.css` into `<vault>/.obsidian/plugins/book-notes/`.
2. Enable **Book Notes** in Settings → Community plugins.

For beta updates, add this repo in [BRAT](https://github.com/TfTHacker/obsidian42-brat).

## Usage

1. Run **"Book Notes: Create new book note"** from the command palette (or click the book ribbon icon).
2. Search by title, author, or ISBN → pick a book from the results.
3. A note is created from your template in the configured folder.

**"Book Notes: Insert book metadata"** inserts the rendered template at the top of the current note instead.

### Settings

- **Service provider** — Open Library (default, no key) or Hardcover (needs token).
- **Hardcover API token** — generate at [hardcover.app/account/api](https://hardcover.app/account/api); paste in settings.
- **New file location** — folder for created notes (default `Books`).
- **New file name format** — supports `{{title}}`, `{{author}}`, `{{DATE}}`, `{{DATE:FORMAT}}`. Empty = `{{title}} - {{author}}`.
- **Template file** — path to your template `.md`. Empty = built-in default template.
- **Show cover images in search** — thumbnails in the results list.
- **Download cover image to vault** — saves the cover into the vault (uses `{{localCoverImage}}`); otherwise the remote URL is embedded.
- **Open note after creation** — opens the new note automatically.

## Backends

- **Open Library** (default) — free, no key. Best coverage; English-centric. Search returns work-level data, so `description` is empty and `publishDate` is year-only.
- **Hardcover** (opt-in) — free, requires a Bearer token. Richer metadata (ratings, genres, series, descriptions).

## Template variables

Every book field is a `{{fieldName}}` token, interpolated across the whole note (frontmatter and body). Unknown tokens become empty strings.

### Notes on array and date fields

- **Three array shapes** — for multi-value fields (authors, categories, genres, series):
  - `{{X}}` / `{{author}}` — comma-joined string (e.g. `Frank Herbert, Brian Herbert`). For body text.
  - `{{XList}}` — YAML block list (e.g. `\n  - Frank Herbert\n  - Brian Herbert`). For frontmatter: `key:{{XList}}` (no space after colon).
  - `{{XLinkedList}}` — YAML block list of **quoted wikilinks** (e.g. `\n  - "[[Frank Herbert]]"`). Quoting is required so Obsidian's property parser reads them correctly.
- **Date tokens** — `{{DATE}}` (today, `YYYY-MM-DD`) and `{{DATE:FORMAT}}` with any [moment.js](https://momentjs.com/docs/#/displaying/format/) format. Also work in the file name format setting.
- **YAML lists require no space after colon**: `authors:{{authorsList}}`, not `authors: {{authorsList}}`. An empty array renders as `key:` (valid YAML null).

### Complete reference

| Variable                   | Source       | Description                                                                                                |
| -------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------- |
| **Identity**               |              |                                                                                                            |
| `{{title}}`                | both         | Book title.                                                                                                |
| `{{subtitle}}`             | both         | Subtitle (often empty from Open Library search).                                                           |
| `{{description}}`          | both         | Book description (Hardcover populates; Open Library search does not).                                      |
| **Authors**                |              |                                                                                                            |
| `{{author}}`               | both         | Comma-joined string, e.g. `Frank Herbert, Brian Herbert`.                                                  |
| `{{authors}}`              | both         | Same as `{{author}}` (array stringified to comma-joined).                                                  |
| `{{authorsList}}`          | both         | YAML block list of author names.                                                                           |
| `{{authorsLinkedList}}`    | both         | YAML block list of quoted `[[author]]` wikilinks.                                                          |
| **Classification**         |              |                                                                                                            |
| `{{category}}`             | both         | Top categories/genres, comma-joined.                                                                       |
| `{{categories}}`           | both         | Same as `{{category}}` (array stringified).                                                                |
| `{{categoriesList}}`       | both         | YAML block list of categories (Open Library subjects, capped at 5).                                        |
| `{{categoriesLinkedList}}` | both         | YAML block list of quoted `[[category]]` wikilinks.                                                        |
| `{{genres}}`               | Hardcover    | Genres, comma-joined.                                                                                      |
| `{{genresList}}`           | Hardcover    | YAML block list of genres.                                                                                 |
| `{{genresLinkedList}}`     | Hardcover    | YAML block list of quoted `[[genre]]` wikilinks.                                                           |
| `{{series}}`               | Hardcover    | Series names, comma-joined.                                                                                |
| `{{seriesList}}`           | Hardcover    | YAML block list of series names.                                                                           |
| `{{seriesLinkedList}}`     | Hardcover    | YAML block list of quoted `[[series]]` wikilinks.                                                          |
| **Publication**            |              |                                                                                                            |
| `{{publisher}}`            | both         | Publisher (Open Library: first; Hardcover: empty from search).                                             |
| `{{publishDate}}`          | both         | Publication year, e.g. `1965`.                                                                             |
| `{{totalPage}}`            | both         | Page count (Open Library: median across editions).                                                         |
| **Covers**                 |              |                                                                                                            |
| `{{coverUrl}}`             | both         | Display-size cover (~500px). Best for inline `![](...)` embeds.                                            |
| `{{coverSmallUrl}}`        | Open Library | Small thumbnail (~80px).                                                                                   |
| `{{coverMediumUrl}}`       | Open Library | Medium thumbnail (~200px).                                                                                 |
| `{{coverLargeUrl}}`        | both         | Large cover (Open Library ~500px; Hardcover = coverUrl).                                                   |
| `{{coverOriginalUrl}}`     | both         | Full-resolution original. Open Library: uncapped. Hardcover: ~500px (best from search). Ideal for banners. |
| `{{localCoverImage}}`      | both         | Vault path of downloaded cover (only if download is enabled).                                              |
| **Identifiers & links**    |              |                                                                                                            |
| `{{isbn}}`                 | both         | ISBN-13 if available, else ISBN-10.                                                                        |
| `{{isbn10}}`               | both         | ISBN-10.                                                                                                   |
| `{{isbn13}}`               | both         | ISBN-13.                                                                                                   |
| `{{asin}}`                 | Hardcover    | Amazon ASIN (not populated from search).                                                                   |
| `{{link}}`                 | both         | URL to the book on the backend.                                                                            |
| **Hardcover enrichment**   |              |                                                                                                            |
| `{{rating}}`               | Hardcover    | Average rating, e.g. `4.32`.                                                                               |
| `{{ratingsCount}}`         | Hardcover    | Number of ratings.                                                                                         |
| **Other**                  |              |                                                                                                            |
| `{{status}}`               | —            | Never set by the API; for user tracking in custom templates.                                               |
| `{{DATE}}`                 | —            | Today's date (`YYYY-MM-DD`).                                                                               |
| `{{DATE:FORMAT}}`          | —            | Today's date with a custom moment.js format.                                                               |

### Example template

```markdown
---
title: "{{title}}"
author:{{authorsLinkedList}}
publisher: "{{publisher}}"
publishDate: "{{publishDate}}"
isbn: "{{isbn}}"
cover: "{{coverUrl}}"
banner: "{{coverOriginalUrl}}"
status: unread
created: {{DATE:YYYY-MM-DD}}
---

![cover|200]({{coverUrl}})

# {{title}}

## Summary

{{description}}
```

## Cover images

- `{{coverUrl}}` — display size for inline embeds.
- `{{coverOriginalUrl}}` — full-res for banner plugins. Open Library returns the uncapped original; Hardcover falls back to ~500px from search.
- Enable **"Download cover image to vault"** to save the cover locally → use `{{localCoverImage}}` for the vault path. The extension is sniffed from the content type.

## YAML safety

Quote string frontmatter values (e.g. `title: "{{title}}"`) to avoid corruption from titles containing colons or special characters. For list fields, use `key:{{field}}` with no space after the colon.

## License

MIT
