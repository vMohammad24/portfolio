import catppuccin from '@catppuccin/tailwindcss';
import type { Config } from 'tailwindcss';
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {}
	},

	plugins: [
		catppuccin({
			defaultFlavour: 'mocha'
		})
	]
} satisfies Config;
