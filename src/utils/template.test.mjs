import assert from 'assert';

// Mirror of the book-field replacement logic from src/utils/template.ts (Pass 2 + strip).
// Tested in isolation because template.ts imports `obsidian` (for moment), which is not
// available outside the Obsidian runtime.
function replaceBookVars(text, entries) {
	for (const [key, val] of entries) {
		let replacement = '';
		if (Array.isArray(val)) replacement = val.join(', ');
		else if (val != null) replacement = String(val);
		text = text.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'ig'), () => replacement);
	}
	return text.replace(/\{\{\s*\w+\s*\}\}/gi, '');
}

// Test 1: known vars substituted, unknown vars stripped
{
	const result = replaceBookVars(
		'{{title}} by {{author}} — {{unknownVar}}',
		[['title', 'Dune'], ['author', 'Frank Herbert']]
	);
	assert.strictEqual(result, 'Dune by Frank Herbert — ');
}

// Test 2: arrays joined with ', '
{
	const result = replaceBookVars(
		'Authors: {{authors}}',
		[['authors', ['Frank Herbert', 'Neil Gaiman']]]
	);
	assert.strictEqual(result, 'Authors: Frank Herbert, Neil Gaiman');
}

// Test 3: numbers stringified
{
	const result = replaceBookVars(
		'{{totalPage}} pages',
		[['totalPage', 412]]
	);
	assert.strictEqual(result, '412 pages');
}

// Test 4: undefined/empty entries left empty
{
	const result = replaceBookVars(
		'[{{isbn10}}]',
		[['isbn10', '']]
	);
	assert.strictEqual(result, '[]');
}

// Test 5: case-insensitive matching
{
	const result = replaceBookVars(
		'{{TITLE}} {{Author}}',
		[['title', 'Dune'], ['author', 'Herbert']]
	);
	assert.strictEqual(result, 'Dune Herbert');
}

// Test 6: frontmatter template renders cleanly
{
	const template = `---
title: "{{title}}"
author: "{{author}}"
---
# {{title}}`;
	const result = replaceBookVars(template, [['title', 'Dune'], ['author', 'Frank Herbert']]);
	assert.strictEqual(result, `---
title: "Dune"
author: "Frank Herbert"
---
# Dune`);
}

// Test 7: values containing $& / $$ / $' / $` render literally (not interpreted)
{
	const result = replaceBookVars(
		'Desc: {{description}}',
		[['description', 'Sale $& today $$ half $` start $\' end']]
	);
	assert.strictEqual(result, 'Desc: Sale $& today $$ half $` start $\' end');
}

// Test 8: $& in value does not leave the {{token}} behind
{
	const result = replaceBookVars(
		'{{title}}',
		[['title', 'Win $& prizes']]
	);
	assert.strictEqual(result, 'Win $& prizes');
}

console.log('✓ All template engine tests passed');
