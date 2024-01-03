const tsRules = {
	"@typescript-eslint/ban-types": "off",
	"@typescript-eslint/no-empty-interface": "off",
};

const tsParserOptions = {
		project: true,
		tsconfigRootDir: __dirname,
}

module.exports = {
	env: {
		node: true,
		browser: true,
	},
	extends: ["eslint:recommended", "plugin:astro/recommended"],
	parserOptions: {
		ecmaVersion: "latest",
		sourceType: "module",
	},
	globals: {
		astroHTML: true,
	},
	rules: {
		"no-unused-vars": "off",
		"no-mixed-spaces-and-tabs": "off",
	},
	overrides: [
		{
			files: ["*.astro"],
			parser: "astro-eslint-parser",
			parserOptions: {
				parser: "@typescript-eslint/parser",
				extraFileExtensions: [".astro"],
				parserOptions: {
					...tsParserOptions,
				},
			},
				rules: {
				...tsRules,
			},
		},
		{
			files: ["*.ts"],
			parser: "@typescript-eslint/parser",
			extends: ["plugin:@typescript-eslint/recommended-type-checked"],
			parserOptions: {
				...tsParserOptions,
			},
			rules: {
				...tsRules,
			},
		},
		{
			// Define the configuration for `<script>` tag.
			// Script in `<script>` is assigned a virtual file name with the `.js` extension.
			files: ["**/*.astro/*.js", "*.astro/*.js"],
			parser: "@typescript-eslint/parser",
		},
	],
};
