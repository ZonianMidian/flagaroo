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
			$types: resolve('./src/lib/types'),
			$utils: resolve('./src/lib/utils'),
			$locales: resolve('./src/locales'),
			$stores: resolve('./src/lib/stores'),
			$components: resolve('./src/components')
		}
	}
};

export default config;
