import tseslint from 'typescript-eslint';

export default tseslint.config(
	{
		ignores: [
			'node_modules/',
			'main.js',
			'**/*.test.mjs',
			'esbuild.config.mjs',
		],
	},
	// Non-type-checked base for all .ts files (no parserOptions.project required)
	...tseslint.configs.recommended,
	// Type-checked rules ONLY for src/**/*.ts (has projectService)
	{
		files: ['src/**/*.ts'],
		extends: [...tseslint.configs.recommendedTypeChecked],
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: {
			// The Obsidian community review enforces these; keep them strict.
			'@typescript-eslint/no-explicit-any': 'error',
			'@typescript-eslint/no-unsafe-assignment': 'error',
			'@typescript-eslint/no-unsafe-member-access': 'error',
			'@typescript-eslint/no-unsafe-argument': 'error',
			'@typescript-eslint/no-unsafe-call': 'error',
			'@typescript-eslint/no-unsafe-return': 'error',
			'@typescript-eslint/no-misused-promises': 'error',
		},
	},
);
