/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.tsx"],
	theme: {
		extend: {
			colors: {
				highlight: "var(--text-accent)",
				neutral: {
					100: "#abb2bf", // gray-2, lightest gray
					200: "#5c6370", // gray-1
					300: "#424958", // background-modifier-border, lighter border shade
					400: "#353b47", // interactive-hover, darker interactive background
					500: "#272b34", // background-primary, primary background
					600: "#20242b", // background-primary-alt and background-secondary, slightly darker primary
					700: "#1a1e24", // background-secondary-alt, even darker
					800: "#18191e", // panel-border-color, darker still
					900: "#000000", // background-accent, darkest possible (black)
				},
			},
		},
	},
	plugins: [],
};
