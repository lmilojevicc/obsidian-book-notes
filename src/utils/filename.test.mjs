import assert from 'assert';

// Faithful JS copies of sanitizeFileName + makeFileName (mirrors
// src/utils/filename.ts). Tested in isolation because filename.ts imports
// `moment` from 'obsidian'.

function sanitizeFileName(text) {
	return text
		.replace(/[\\,#%&{}/*<>$":@.?|]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

function makeFileName(book, format) {
	const template = format?.trim() || '{{title}} - {{author}}';
	// Skip {{DATE}} resolution (needs moment); we only test title/author paths here.
	let name = template.replace(/\{\{\s*DATE\s*(:([^}]+))?\s*\}\}/gi, 'DATEPLACEHOLDER');
	const author = book.author || '';
	name = name.replace(/\{\{\s*title\s*\}\}/gi, () => book.title || '');
	name = name.replace(/\{\{\s*author\s*\}\}/gi, () => author);
	return sanitizeFileName(name);
}

// sanitizeFileName strips illegal chars
{
	assert.strictEqual(sanitizeFileName('A:B?C*D'), 'ABCD');
}

// sanitizeFileName strips $ and & (both in the illegal regex)
{
	assert.strictEqual(sanitizeFileName('Win $& prizes'), 'Win prizes');
}

// sanitizeFileName collapses whitespace and trims
{
	assert.strictEqual(sanitizeFileName('  foo   bar  '), 'foo bar');
}

// sanitizeFileName strips slashes (path traversal guard)
{
	assert.strictEqual(sanitizeFileName('a/b\\c'), 'abc');
}

// makeFileName: default format
{
	const name = makeFileName({ title: 'Dune', author: 'Frank Herbert' }, '');
	assert.strictEqual(name, 'Dune - Frank Herbert');
}

// makeFileName: explicit format
{
	const name = makeFileName({ title: 'Dune', author: 'Frank Herbert' }, '{{title}} ({{author}})');
	assert.strictEqual(name, 'Dune (Frank Herbert)');
}

// makeFileName: $& in title does NOT corrupt via the replacement function
{
	const name = makeFileName({ title: 'Win $& prizes', author: 'X' }, '{{title}}');
	assert.strictEqual(name, 'Win prizes'); // $ and & stripped by sanitize
}

// makeFileName: $& in title doesn't leave the {{token}} behind
{
	const name = makeFileName({ title: 'Sale $& today', author: 'X' }, '{{title}}');
	assert.ok(!name.includes('{{title}}'), `name still has token: ${name}`);
}

// makeFileName: empty title/author → just separator (degenerate but no crash)
{
	const name = makeFileName({ title: '', author: '' }, '');
	assert.strictEqual(name, '-');
}

// makeFileName: title with colon gets stripped
{
	const name = makeFileName({ title: 'Sub: Title', author: 'Auth' }, '{{title}} - {{author}}');
	assert.strictEqual(name, 'Sub Title - Auth');
}

console.log('✓ All filename util tests passed');
