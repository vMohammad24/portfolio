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
				},
				slideUp: {
					'0%': { transform: 'translateY(20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				pulse: {
					'0%, 100%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(1.05)' }
				},
				float: {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				spin: {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' }
				},
				chartAnimation: {
					'0%': { strokeDasharray: '0 1000', opacity: '0' },
					'100%': { strokeDasharray: 'var(--final-dasharray)', opacity: '1' }
				},
				fillWidth: {
					'0%': { width: '0%' },
					'100%': { width: 'var(--proficiency)' }
				},
				progressIndeterminate: {
					'0%': { left: '-100%', width: '100%' },
					'100%': { left: '100%', width: '100%' }
				},
			},
			animation: {
				shimmer: 'shimmer 3s linear infinite',
				'slide-up': 'slideUp 0.6s ease-out forwards',
				pulse: 'pulse 2s ease-in-out infinite',
				float: 'float 3s ease-in-out infinite',
				spin: 'spin 1.5s linear infinite',
				'chart-animated': 'chartAnimation 1.5s ease-out forwards',
				proficiency: 'fillWidth 1s ease-out forwards',
				'progress-indeterminate': 'progressIndeterminate 1.5s infinite ease-in-out',
			},
			transitionProperty: {
				'transform-opacity': 'transform, opacity'
			}
		}
	},

	plugins: [
		catppuccin({
			defaultFlavour: 'mocha'
		})
	]
} satisfies Config;
