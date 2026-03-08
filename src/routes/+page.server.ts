import matter from 'gray-matter';
import { calculateReadingTime } from '$lib/markdown';

export async function load() {
	const files = import.meta.glob('/data/blog/*.md', { query: '?raw', import: 'default' });

	const posts = [];

	for (const [path, resolver] of Object.entries(files)) {
		const raw = (await resolver()) as string;
		const { data, content } = matter(raw);
		const slug = path.split('/').pop()!.replace('.md', '');

		posts.push({
			slug,
			title: data.title,
			date: data.date,
			excerpt: data.excerpt,
			tags: data.tags ?? [],
			category: data.category ?? 'uncategorized',
			readingTime: calculateReadingTime(content)
		});
	}

	posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

	return { latestPosts: posts.slice(0, 3) };
}
