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

Every book field is available as a `{{fieldName}}` token, interpolated across the whole note (frontmatter and body):

| Variable | Notes |
|---|---|
| `{{title}}`, `{{subtitle}}` | |
| `{{author}}` | Comma-joined string. |
| `{{authors}}` | Array — stringified as a comma-joined list. |
| `{{category}}`, `{{categories}}` | Same duality as author/authors. |
| `{{publisher}}`, `{{publishDate}}` | |
| `{{totalPage}}` | |
| `{{coverUrl}}` | Remote cover URL. |
| `{{coverSmallUrl}}`, `{{coverMediumUrl}}`, `{{coverLargeUrl}}` | |
| `{{localCoverImage}}` | Vault path; only set when "Download cover image to vault" is enabled. |
| `{{isbn}}`, `{{isbn10}}`, `{{isbn13}}` | |
| `{{description}}` | Open Library search does not populate this; Hardcover does. |
| `{{link}}` | |
| `{{rating}}`, `{{ratingsCount}}`, `{{genres}}`, `{{series}}` | Hardcover enrichment. |
| `{{DATE}}`, `{{DATE:YYYY-MM-DD}}` | Current date (configurable format). |
| `{{asin}}` | Hardcover only. |

Unknown tokens are replaced with an empty string.

### YAML safety

When using template variables inside frontmatter, quote string values (e.g. `title: "{{title}}"`) to avoid YAML corruption from titles containing colons or special characters. The built-in default template already does this.

### Example template

```markdown
---
title: "{{title}}"
author: "{{author}}"
publisher: {{publisher}}
publishDate: {{publishDate}}
cover: {{coverUrl}}
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
