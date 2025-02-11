import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		proxy: {
			// cors bypass (trust)
			'/wakatimeStats': {
				target: 'https://wakatime.com/api/v1/users/vMohammad/stats?is_including_today=true',
				changeOrigin: true,
				secure: false,
			}
		}
	}
});
