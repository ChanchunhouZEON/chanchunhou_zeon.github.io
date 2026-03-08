import matter from 'gray-matter';
import { blogCategories } from '$lib/data/blogCategories';

export async function load() {
	const files = import.meta.glob('/data/blog/*.md', { query: '?raw', import: 'default' });

	const countByCategory: Record<string, number> = {};
	const tagsByCategory: Record<string, Set<string>> = {};

	for (const [, resolver] of Object.entries(files)) {
		const raw = (await resolver()) as string;
		const { data } = matter(raw);
		const cat = data.category ?? 'uncategorized';

		countByCategory[cat] = (countByCategory[cat] ?? 0) + 1;

		if (!tagsByCategory[cat]) tagsByCategory[cat] = new Set();
		for (const tag of data.tags ?? []) {
			tagsByCategory[cat].add(tag);
		}
	}

	const categories = blogCategories.map((cat) => ({
		...cat,
		postCount: countByCategory[cat.slug] ?? 0,
		tags: Array.from(tagsByCategory[cat.slug] ?? [])
	}));

	return { categories };
}
