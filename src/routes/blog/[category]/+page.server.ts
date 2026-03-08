import matter from 'gray-matter';
import { calculateReadingTime } from '$lib/markdown';
import { blogCategories } from '$lib/data/blogCategories';
import { error } from '@sveltejs/kit';

interface BlogPostMeta {
	slug: string;
	title: string;
	date: string;
	excerpt: string;
	tags: string[];
	readingTime: string;
	category: string;
	order?: number;
}

export async function load({ params }: { params: { category: string } }) {
	const category = blogCategories.find((c) => c.slug === params.category);
	if (!category) throw error(404, 'Category not found');

	const files = import.meta.glob('/data/blog/*.md', { query: '?raw', import: 'default' });
	const posts: BlogPostMeta[] = [];

	for (const [path, resolver] of Object.entries(files)) {
		const raw = (await resolver()) as string;
		const { data, content } = matter(raw);

		if (data.category !== params.category) continue;

		const slug = path.split('/').pop()!.replace('.md', '');
		posts.push({
			slug,
			title: data.title,
			date: data.date,
			excerpt: data.excerpt,
			tags: data.tags ?? [],
			readingTime: calculateReadingTime(content),
			category: data.category,
			order: data.order as number | undefined
		});
	}

	posts.sort((a, b) => {
		if (a.order != null && b.order != null) return a.order - b.order;
		if (a.order != null) return -1;
		if (b.order != null) return 1;
		return new Date(b.date).getTime() - new Date(a.date).getTime();
	});

	return { posts, category };
}

export function entries() {
	return blogCategories.map((c) => ({ category: c.slug }));
}
