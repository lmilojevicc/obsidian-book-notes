import type { BooksApi } from './books-api';
import type { BookNotesSettings } from '../settings/settings';
import { OpenLibraryApi } from './openlibrary-api';
import { HardcoverApi } from './hardcover-api';

export interface ProviderDef {
	id: string;                          // 'openlibrary'
	label: string;                       // 'Open Library (free, no key)'
	needsToken: boolean;                 // show a token input in settings?
	tokenHelpUrl?: string;               // 'https://hardcover.app/account/api'
	tokenSettingKey?: keyof BookNotesSettings;  // which settings field holds the token
	create: (settings: BookNotesSettings) => BooksApi;
}

export const PROVIDERS: ProviderDef[] = [
	{
		id: 'openlibrary',
		label: 'Open Library (free, no key)',
		needsToken: false,
		create: () => new OpenLibraryApi(),
	},
	{
		id: 'hardcover',
		label: 'Hardcover (free, requires token)',
		needsToken: true,
		tokenHelpUrl: 'https://hardcover.app/account/api',
		tokenSettingKey: 'hardcoverToken',
		create: (s) => new HardcoverApi(s.hardcoverToken),
	},
];

export function getProvider(id: string): ProviderDef | undefined {
	return PROVIDERS.find((p) => p.id === id);
}

export function factoryApi(settings: BookNotesSettings): BooksApi {
	const def = getProvider(settings.serviceProvider) ?? PROVIDERS[0];
	if (!def) throw new Error(`No book provider registered for id "${settings.serviceProvider}"`);
	if (def.needsToken) {
		const tokenValue = def.tokenSettingKey ? settings[def.tokenSettingKey] : '';
		if (!tokenValue) {
			throw new Error(`${def.label} requires a token. Set it in plugin settings.`);
		}
	}
	return def.create(settings);
}
