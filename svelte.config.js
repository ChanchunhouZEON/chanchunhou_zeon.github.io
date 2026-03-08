import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: '404.html',
			precompress: false,
			strict: true
		}),
		paths: {
			base: process.env.BASE_PATH || ''
		},
		prerender: {
			handleHttpError: ({ path, referrer }) => {
				// Allow missing blog-assets and broken wikilinks from blog posts
				if (path.startsWith('/blog_assets/')) return 'warn';
				if (referrer?.startsWith('/blog/')) return 'warn';
				throw new Error(`404: ${path}`);
			}
		}
	}
};

export default config;
