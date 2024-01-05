module.exports = {
	useTabs: true,
	plugins: [require.resolve("prettier-plugin-astro")],
	overrides: [
		{
			files: ["**/*.astro"],
			options: {
				parser: "astro",
			},
		},
	],
};
