import { App, PluginSettingTab, Setting } from 'obsidian';
import type BookNotesPlugin from '../main';
import { FileSuggest, FolderSuggest } from './suggesters';
import { PROVIDERS, getProvider } from '../apis/registry';

// Derived from PROVIDERS so adding a provider automatically extends the type.
export type ServiceProvider = typeof PROVIDERS[number]['id'];

export interface BookNotesSettings {
	serviceProvider: ServiceProvider;
	hardcoverToken: string;
	folder: string;              // New file location. Empty = vault root.
	fileNameFormat: string;      // Empty → "{{title}} - {{author}}"
	templateFile: string;        // Path to template .md. Empty → DEFAULT_TEMPLATE.
	showCoverImageInSearch: boolean;
	enableCoverImageSave: boolean;
	coverImagePath: string;      // Folder for downloaded covers. Empty → same as note folder.
	openPageOnCompletion: boolean;
}

export const DEFAULT_SETTINGS: BookNotesSettings = {
	serviceProvider: 'openlibrary',
	hardcoverToken: '',
	folder: 'Books',
	fileNameFormat: '',
	templateFile: '',
	showCoverImageInSearch: true,
	enableCoverImageSave: false,
	coverImagePath: '',
	openPageOnCompletion: true,
};

export class BookNotesSettingTab extends PluginSettingTab {
	plugin: BookNotesPlugin;

	constructor(app: App, plugin: BookNotesPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		// 1. Service provider dropdown (built from PROVIDERS registry)
		new Setting(containerEl)
			.setName('Service provider')
			.setDesc('Choose the book search backend.')
			.addDropdown((d) => {
				PROVIDERS.forEach((p) => { d.addOption(p.id, p.label); });
				d.setValue(this.plugin.settings.serviceProvider)
				 .onChange((v: string) => {
					 const providerId = PROVIDERS.find((p) => p.id === v)?.id;
					 if (providerId) {
						 this.plugin.settings.serviceProvider = providerId;
						 void this.plugin.saveSettings();
						 this.display(); // re-render to show/hide token field
					 }
				 });
			});

		// 2. Token field (generic — shown only when the selected provider needs one)
		const def = getProvider(this.plugin.settings.serviceProvider);
		if (def?.needsToken && def.tokenSettingKey) {
			const tokenKey = def.tokenSettingKey;
			new Setting(containerEl)
				.setName(`${def.label} token`)
				.setDesc(def.tokenHelpUrl ? `Generate at ${def.tokenHelpUrl}` : 'API token')
				.addText((t) =>
					t.setPlaceholder('Token')
					 .setValue(this.plugin.settings[tokenKey] as string)
					 .onChange((v) => {
						(this.plugin.settings as unknown as Record<string, unknown>)[tokenKey] = v.trim();
						 void this.plugin.saveSettings();
					 }));
		}

		// 3. New file location (FolderSuggest)
		new Setting(containerEl)
			.setName('New file location')
			.setDesc('Folder where book notes are created. Empty = vault root.')
			.addText((t) => {
				t.setPlaceholder('Books')
				 .setValue(this.plugin.settings.folder)
				 .onChange((v) => {
					 this.plugin.settings.folder = v.trim();
					 void this.plugin.saveSettings();
				 });
				new FolderSuggest(this.app, t.inputEl);
			});

		// 4. File name format
		new Setting(containerEl)
			.setName('New file name format')
			.setDesc('Supports {{title}}, {{author}}, {{DATE}}, {{DATE:YYYY-MM-DD}}. Empty = {{title}} - {{author}}.')
			.addText((t) =>
				t.setPlaceholder('{{title}} - {{author}}')
				 .setValue(this.plugin.settings.fileNameFormat)
				 .onChange((v) => {
					 this.plugin.settings.fileNameFormat = v;
					 void this.plugin.saveSettings();
				 }));

		// 5. Template file (FileSuggest)
		new Setting(containerEl)
			.setName('Template file')
			.setDesc('Path to template. Empty = built-in default template.')
			.addText((t) => {
				t.setPlaceholder('Templates/Book Template.md')
				 .setValue(this.plugin.settings.templateFile)
				 .onChange((v) => {
					 this.plugin.settings.templateFile = v.trim();
					 void this.plugin.saveSettings();
				 });
				new FileSuggest(this.app, t.inputEl);
			});

		// 6. Show cover in search
		new Setting(containerEl)
			.setName('Show cover images in search')
			.addToggle((tg) =>
				tg.setValue(this.plugin.settings.showCoverImageInSearch)
				  .onChange((v) => {
					  this.plugin.settings.showCoverImageInSearch = v;
					  void this.plugin.saveSettings();
				  }));

		// 7. Enable cover download
		new Setting(containerEl)
			.setName('Download cover image to vault')
			.setDesc('If off, cover URL is embedded directly. If on, cover is saved to vault.')
			.addToggle((tg) =>
				tg.setValue(this.plugin.settings.enableCoverImageSave)
				  .onChange((v) => {
					  this.plugin.settings.enableCoverImageSave = v;
					  void this.plugin.saveSettings();
				  }));

		// 8. Cover image path (shown only when download is enabled)
		if (this.plugin.settings.enableCoverImageSave) {
			new Setting(containerEl)
				.setName('Cover image folder')
				.setDesc('Where downloaded cover images are stored.')
				.addText((t) => {
					t.setPlaceholder('Assets/covers')
					 .setValue(this.plugin.settings.coverImagePath)
					 .onChange((v) => {
						 this.plugin.settings.coverImagePath = v.trim();
						 void this.plugin.saveSettings();
					 });
					new FolderSuggest(this.app, t.inputEl);
				});
		}

		// 9. Open page on completion
		new Setting(containerEl)
			.setName('Open note after creation')
			.addToggle((tg) =>
				tg.setValue(this.plugin.settings.openPageOnCompletion)
				  .onChange((v) => {
					  this.plugin.settings.openPageOnCompletion = v;
					  void this.plugin.saveSettings();
				  }));
	}
}
