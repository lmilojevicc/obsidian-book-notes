# AGENTS.md

Obsidian plugin (`book-notes`): search books via Open Library (default, no key) or
Hardcover (opt-in token), pick a result, create a templated note. Re-implementation
of `anpigon/obsidian-book-search-plugin` UX with different, more reliable backends.

## Commands

```bash
npm run dev      # esbuild watch → main.js (inline sourcemaps)
npm run build    # tsc strict (noEmit) + esbuild production → main.js  [VERIFY BEFORE COMMIT]
npm test         # 3 plain-node assert files: template, filename, API mappers (~26 assertions)
```

**Always run `npm run build && npm test` before committing.** Build is strict TS
(`noUncheckedIndexedAccess` enabled) — it catches real bugs.

## Architecture

```text
src/
  main.ts                    Plugin entry: commands, ribbon, searchAndPick loop, note creation
  constants.ts               DEFAULT_TEMPLATE (the built-in note template)
  models/book.ts             Canonical Book interface — EVERY field becomes a {{var}}
  apis/
    books-api.ts             BooksApi interface + apiGet/apiPost (requestUrl helpers)
    registry.ts              PROVIDERS[] + ProviderDef + factoryApi  ← ADD BACKENDS HERE
    openlibrary-api.ts       Open Library /search.json → Book  (mapOpenLibraryDoc exported)
    hardcover-api.ts         Hardcover GraphQL → Book            (mapHardcoverDocument exported)
  settings/
    settings.ts              BookNotesSettings + DEFAULT_SETTINGS + settings tab
    suggesters.ts            FileSuggest + FolderSuggest (AbstractInputSuggest)
  utils/
    template.ts              renderTemplate ({{var}} engine) + yamlBlockList helper
    filename.ts              sanitizeFileName + makeFileName
    cover.ts                 downloadCover (requestUrl → vault.createBinary)
  views/
    book-search-modal.ts     Search input modal (loading state, initialQuery pre-fill)
    book-suggest-modal.ts    Results picker (SuggestModal<Book>)
```

## Key concepts

**Adding a backend** = 1 new API class + 1 entry in `PROVIDERS` (registry.ts) + token
field in BookNotesSettings if it needs a key. Dropdown/factory/token-UI wire themselves.
`ServiceProvider` type is derived (`typeof PROVIDERS[number]['id']`), so it can't drift.

**Template engine** = `{{var}}` only (NO inline `<% %>` scripts — locked decision). Applied
to whole note (frontmatter + body). Two regex passes: `{{DATE}}`/`{{DATE:fmt}}` then every
Book field; unknown tokens stripped. **Must use a replacement function** (not a string) to
avoid `$&`/`$$` corruption — this is tested, don't regress it.

**Array field variants** (per authors/categories/genres/series):

- `{{X}}` — comma-joined string (body use)
- `{{XList}}` — YAML block list, unquoted items (frontmatter)
- `{{XLinkedList}}` — YAML block list of **quoted** wikilinks (`  - "[[X]]"`) — quoted because
  Obsidian's property parser misreads unquoted `- [[X]]` as multitext until manually clicked.

**Cover images**: URL-embed by default (`{{coverUrl}}` display, `{{coverOriginalUrl}}`
full-res for banners — Open Library original is uncapped, Hardcover falls back to ~500px).
Opt-in download setting → `{{localCoverImage}}`.

**minAppVersion `1.4.10`** — required for `AbstractInputSuggest`. Don't lower it.

## Obsidian-specific gotchas

- **Use `requestUrl` (from 'obsidian'), never `fetch`** — CORS-free in Electron.
- **`SuggestModal.onClose` fires BEFORE `onChooseSuggestion`** on selection. The cancel-null
  in `onClose` must be deferred via `setTimeout(..., 0)` so `onChooseSuggestion` wins the race.
  This was a real silent bug — don't "simplify" it.
- **`BookSearchModal`**: set `resolved=true` and call the callback BEFORE `this.close()`,
  not after — `close()` synchronously fires `onClose`.
- **Frontmatter YAML safety**: the default template quotes all string values. Don't unquote.
- **`noUncheckedIndexedAccess`**: `array[0]` is `T | undefined` — guard it.

## Release / Community Plugins

Plugin ships via **GitHub Release assets**, not the main branch. The release workflow
builds and attaches `main.js` + `manifest.json` + `styles.css` on tag push.

**To release:**

1. Bump `version` in both `manifest.json` and `package.json` (keep in sync).
2. Update `versions.json`: `{ "<new version>": "<minAppVersion>" }`.
3. `git tag <version> && git push origin <version>` (tag matches manifest version, **no `v` prefix**).
4. Workflow publishes the release. Verify the 3 assets are attached.

**Community store PR** (one-time): add an entry to `community-plugins.json` in
`obsidianmd/obsidian-releases`:

```json
{
  "id": "book-notes",
  "name": "Book Notes",
  "author": "<author>",
  "description": "Search books via Open Library or Hardcover and create templated notes.",
  "repo": "<owner>/obsidian-book-notes"
}
```

Review is slow (weeks). Submission validator checks: id matches manifest, the 3 release
assets exist with correct filenames, version matches the tag.

## Dev install into a vault

```bash
cp main.js manifest.json styles.css <vault>/.obsidian/plugins/book-notes/
```

Then reload Obsidian (Cmd+R) and enable the plugin. `main.js` is gitignored (build artifact).
`data.json` in the plugin folder is user settings — never commit it.

## What NOT to do

- Don't add `<% %>` inline-script template support (locked out; security + scope).
- Don't add Nunjucks/Handlebars (the custom engine is intentional and ~30 lines).
- Don't hardcode provider checks (`if provider === 'hardcover'`) — use the registry.
- Don't commit `main.js`, `data.json`, or `node_modules/`.
- Don't lower `minAppVersion` below 1.4.10.
