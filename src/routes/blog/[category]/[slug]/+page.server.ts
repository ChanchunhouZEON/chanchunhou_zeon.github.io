import matter from 'gray-matter';
import { renderMarkdown, calculateReadingTime } from '$lib/markdown';
import { blogCategories } from '$lib/data/blogCategories';
import { error } from '@sveltejs/kit';

export async function load({ params }: { params: { category: string; slug: string } }) {
	const category = blogCategories.find((c) => c.slug === params.category);
	if (!category) throw error(404, 'Category not found');

	const files = import.meta.glob('/src/content/blog/*.md', { query: '?raw', import: 'default' });
	const filePath = `/src/content/blog/${params.slug}.md`;
	const resolver = files[filePath];

	if (!resolver) throw error(404, 'Post not found');

	const raw = (await resolver()) as string;
	const { data, content } = matter(raw);

	if (data.category !== params.category) throw error(404, 'Post not found');

	const html = await renderMarkdown(content);

	return {
		post: {
			slug: params.slug,
			title: data.title,
			date: data.date,
			excerpt: data.excerpt,
			tags: data.tags ?? [],
			readingTime: calculateReadingTime(content),
			content: html
		},
		category
	};
}

export function entries() {
	const files = import.meta.glob('/src/content/blog/*.md', {
		query: '?raw',
		import: 'default',
		eager: true
	});

	const entries: { category: string; slug: string }[] = [];
	for (const [path, raw] of Object.entries(files)) {
		const { data } = matter(raw as string);
		const slug = path.split('/').pop()!.replace('.md', '');
		entries.push({ category: data.category, slug });
	}

	return entries;
}
