import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import adapter from '@sveltejs/adapter-node';
import { resolve } from 'path';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			out: 'build'
		}),
		alias: {
			$data: resolve('./src/lib/data'),
			$utils: resolve('./src/lib/utils'),
			$locales: resolve('./src/locales'),
			$components: resolve('./src/components')
		}
	}
};

export default config;
