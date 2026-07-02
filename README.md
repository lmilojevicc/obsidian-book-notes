# Book Notes

An [Obsidian](https://obsidian.md) plugin to search for books and create templated notes with book metadata. A re-implementation of [obsidian-book-search-plugin](https://github.com/anpigon/obsidian-book-search-plugin)'s UX using more reliable backends.

## Backends

- **Open Library** (default) — free, no API key required. [openlibrary.org](https://openlibrary.org)
- **Hardcover** (opt-in) — free, requires a Bearer token generated at [hardcover.app/account/api](https://hardcover.app/account/api).

## Usage

1. Open the command palette and run **"Book Notes: Create new book note"** (or click the book ribbon icon).
2. Type a title, author, or ISBN and press Enter / click Search.
3. Pick a book from the results list.
4. A note is created from your template with the book metadata interpolated.

Alternatively, run **"Book Notes: Insert book metadata"** to insert the rendered template at the top of the currently open note.

## Template variables

Every book field is available as a `{{fieldName}}` token, interpolated across the whole note (frontmatter and body). Unknown tokens are replaced with an empty string.

### Complete variable reference

| Variable | Source | Description |
|---|---|---|
| `{{title}}` | both | Book title. |
| `{{subtitle}}` | both | Subtitle (often empty from Open Library search). |
| `{{author}}` | both | Authors as a comma-joined string, e.g. `Frank Herbert, Brian Herbert`. |
| `{{authors}}` | both | Authors array — renders as a comma-joined string (use for lists in templates). |
| `{{authorsLinked}}` | both | Authors pre-formatted as wikilinks, e.g. `[[Frank Herbert]], [[Brian Herbert]]`. Use directly (no surrounding brackets). |
| `{{category}}` | both | Top categories/genres as a comma-joined string. |
| `{{categories}}` | both | Categories/genres array — renders as a comma-joined string. |
| `{{categoriesLinked}}` | both | Categories/genres pre-formatted as wikilinks, e.g. `[[Fiction]], [[Fantasy]]`. Use directly (no surrounding brackets). |
| `{{publisher}}` | both | Publisher (Open Library: first publisher; Hardcover: empty from search). |
| `{{publishDate}}` | both | Publication year, e.g. `1965`. |
| `{{totalPage}}` | both | Page count (Open Library: median across editions). |
| `{{coverUrl}}` | both | Display-size cover URL (~500px). Best for inline `![](...)` embeds. |
| `{{coverSmallUrl}}` | Open Library | Small thumbnail (~80px). |
| `{{coverMediumUrl}}` | Open Library | Medium thumbnail (~200px). |
| `{{coverLargeUrl}}` | both | Large cover URL (Open Library ~500px; Hardcover same as coverUrl). |
| `{{coverOriginalUrl}}` | both | **Full-resolution original** cover. On Open Library this is the un-capped original image — ideal for banners. On Hardcover this is the best available from search (~500px). |
| `{{localCoverImage}}` | both | Vault path of the downloaded cover; only set when "Download cover image to vault" is enabled. |
| `{{isbn}}` | both | ISBN-13 if available, otherwise ISBN-10. |
| `{{isbn10}}` | both | ISBN-10. |
| `{{isbn13}}` | both | ISBN-13. |
| `{{asin}}` | Hardcover | Amazon ASIN (Hardcover only; not populated from search). |
| `{{link}}` | both | URL to the book page on the backend (Open Library works link / Hardcover book link). |
| `{{description}}` | both | Book description. Populated by Hardcover; Open Library search does not include it. |
| `{{rating}}` | Hardcover | Average rating (e.g. `4.32`). |
| `{{ratingsCount}}` | Hardcover | Number of ratings. |
| `{{genres}}` | Hardcover | Genres array — renders as a comma-joined string. |
| `{{genresLinked}}` | Hardcover | Genres pre-formatted as wikilinks. |
| `{{series}}` | Hardcover | Series names array — renders as a comma-joined string. |
| `{{seriesLinked}}` | Hardcover | Series names pre-formatted as wikilinks. |
| `{{status}}` | — | Never populated by the API; present for user-editable tracking in custom templates. |

### Cover image tiers

There are several cover variables at different resolutions. Pick the one that matches your use case:

- **`{{coverUrl}}`** — display size (~500px). Use for the inline cover embed in the note body: `![cover|200]({{coverUrl}})`.
- **`{{coverSmallUrl}}`** / **`{{coverMediumUrl}}`** / **`{{coverLargeUrl}}`** — explicit thumbnail/large sizes from Open Library.
- **`{{coverOriginalUrl}}`** — full-resolution original. Use for a **banner** frontmatter field so banner plugins (e.g. Banners) can render a crisp hero image. On Open Library this returns the uncapped original; on Hardcover it falls back to the best available search image (~500px).

### Date tokens

- **`{{DATE}}`** — the current date, formatted `YYYY-MM-DD`.
- **`{{DATE:FORMAT}}`** — the current date with a custom [moment.js](https://momentjs.com/docs/#/displaying/format/) format, e.g. `{{DATE:YYYY-MM-DD HH:mm:ss}}`.

Date tokens also work in the **file name format** setting (e.g. `{{title}} - {{DATE}}`).

### Array fields

Fields stored as arrays (`{{authors}}`, `{{categories}}`, `{{genres}}`, `{{series}}`) render as a **comma-joined string** when interpolated directly. There is no inline-script/loop support; if you need wikilinks, use the pre-formatted variants: `{{authorsLinked}}`, `{{categoriesLinked}}`, `{{genresLinked}}`, `{{seriesLinked}}` (each already contains the `[[...]]` brackets). For a YAML list or other custom formatting, format the value in your template accordingly.

### YAML list fields (for frontmatter)

For frontmatter, you often want a **YAML block list** rather than a comma-joined string. The `*List` and `*LinkedList` fields are pre-formatted with a leading newline and `- ` indentation so they form valid YAML block sequences.

Use them as `key:{{fieldName}}` — **no space after the colon**, because the value starts with a newline:

```markdown
---
authors:{{authorsList}}
authors_linked:{{authorsLinkedList}}
---
```

renders as:

```yaml
---
authors:
  - Frank Herbert
  - Brian Herbert
authors_linked:
  - [[Frank Herbert]]
  - [[Brian Herbert]]
---
```

| Variable | Source | Description |
|---|---|---|
| `{{authorsList}}` | both | Authors as a YAML block list. |
| `{{authorsLinkedList}}` | both | Authors as a YAML block list of wikilinks. |
| `{{categoriesList}}` | both | Categories/subjects as a YAML block list. |
| `{{categoriesLinkedList}}` | both | Categories/subjects as a YAML block list of wikilinks. |
| `{{genresList}}` | Hardcover | Genres as a YAML block list. |
| `{{genresLinkedList}}` | Hardcover | Genres as a YAML block list of wikilinks. |
| `{{seriesList}}` | Hardcover | Series names as a YAML block list. |
| `{{seriesLinkedList}}` | Hardcover | Series names as a YAML block list of wikilinks. |

An empty array renders as an empty string, producing `key:` (valid YAML null).

### YAML safety

When using template variables inside frontmatter, **quote string values** (e.g. `title: "{{title}}"`) to avoid YAML corruption from titles containing colons or special characters. The built-in default template already does this.

### Example template

A template using a full-res banner, a display cover, and common metadata:

```markdown
---
title: "{{title}}"
author: "{{author}}"
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

## Notes

```

## Covers

By default the cover image is embedded via its remote URL (`{{coverUrl}}`). Enable **"Download cover image to vault"** in settings to save the cover into your vault; the path is then available via `{{localCoverImage}}`. The downloaded image extension is sniffed from the response content type (not hardcoded).

## Installation

### Manual

Copy `main.js`, `manifest.json`, and `styles.css` into `<vault>/.obsidian/plugins/book-notes/`, then enable the plugin in Settings → Community plugins.

### BRAT

Add this repository in [BRAT](https://github.com/TfTHacker/obsidian42-brat) to install beta releases.

## License

MIT
