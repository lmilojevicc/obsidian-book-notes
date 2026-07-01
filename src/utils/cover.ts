import { App, normalizePath, requestUrl } from 'obsidian';

export async function downloadCover(
	app: App,
	coverUrl: string,
	slug: string,
	folder: string,
): Promise<string | null> {
	try {
		const res = await requestUrl(coverUrl);

		// Sniff extension from content-type (NOT hardcoded jpg)
		const contentType = res.headers['content-type'] ?? '';
		let ext = 'jpg';
		if (contentType.includes('png')) ext = 'png';
		else if (contentType.includes('webp')) ext = 'webp';
		else if (contentType.includes('gif')) ext = 'gif';

		// Build path
		const fileName = `${slug}.${ext}`;
		const basePath = folder ? `${folder}/${fileName}` : fileName;
		const path = normalizePath(basePath);

		// Ensure folder exists
		const dir = path.substring(0, path.lastIndexOf('/'));
		if (dir && !app.vault.getAbstractFileByPath(dir)) {
			await app.vault.createFolder(dir);
		}

		// Write binary
		await app.vault.createBinary(path, res.arrayBuffer);
		return path;
	} catch (e) {
		console.warn('Book Notes: cover download failed', e);
		return null;
	}
}
