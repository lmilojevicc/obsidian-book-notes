import { AbstractInputSuggest, App, TFile, TFolder } from 'obsidian';

export class FileSuggest extends AbstractInputSuggest<TFile> {
	constructor(app: App, private inputEl: HTMLInputElement) {
		super(app, inputEl);
	}
	getSuggestions(query: string): TFile[] {
		const q = query.toLowerCase();
		return this.app.vault.getMarkdownFiles()
			.filter((f) => f.path.toLowerCase().includes(q));
	}
	renderSuggestion(file: TFile, el: HTMLElement) { el.setText(file.path); }
	selectSuggestion(file: TFile) {
		this.inputEl.value = file.path;
		this.inputEl.dispatchEvent(new Event('input'));
		this.close();
	}
}

export class FolderSuggest extends AbstractInputSuggest<TFolder> {
	constructor(app: App, private inputEl: HTMLInputElement) {
		super(app, inputEl);
	}
	getSuggestions(query: string): TFolder[] {
		const q = query.toLowerCase();
		return this.app.vault.getAllLoadedFiles()
			.filter((f): f is TFolder => f instanceof TFolder && f.path.toLowerCase().includes(q));
	}
	renderSuggestion(folder: TFolder, el: HTMLElement) { el.setText(folder.path); }
	selectSuggestion(folder: TFolder) {
		this.inputEl.value = folder.path;
		this.inputEl.dispatchEvent(new Event('input'));
		this.close();
	}
}
