import catppuccin from '@catppuccin/tailwindcss';
import type { Config } from 'tailwindcss';
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			keyframes: {
				shimmer: {
					'0%': { backgroundPosition: '200% 0' },
					'100%': { backgroundPosition: '-200% 0' }
				}
			},
			animation: {
				shimmer: 'shimmer 3s linear infinite'
			}
		}
	},

	plugins: [
		catppuccin({
			defaultFlavour: 'mocha'
		})
	]
} satisfies Config;
