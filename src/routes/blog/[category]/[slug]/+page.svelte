<script lang="ts">
	import { base } from '$app/paths';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const post = data.post;
	const category = data.category;
</script>

<svelte:head>
	<title>{post.title}</title>
	<meta name="description" content={post.excerpt} />
</svelte:head>

<article class="blog-article mx-auto max-w-3xl px-6 pt-32 pb-20">
	<a href="{base}/blog/{category.slug}" class="mb-8 inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-accent dark:hover:text-accent-cyan">
		<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
		{category.name}
	</a>

	<header class="mb-14 border-b border-slate-200/50 pb-10 dark:border-slate-700/30">
		<div class="mb-4 flex items-center gap-3 text-sm text-slate-400">
			<time>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time>
			<span class="text-slate-300 dark:text-slate-600">/</span>
			<span>{post.readingTime} read</span>
		</div>
		<h1 class="mb-6 text-3xl font-extrabold leading-[1.2] tracking-tight md:text-4xl lg:text-[2.75rem]">{post.title}</h1>
		<div class="flex flex-wrap gap-2">
			{#each post.tags as tag}
				<span class="tag !px-3 !py-1 !text-sm">{tag}</span>
			{/each}
		</div>
	</header>

	<div class="blog-prose">
		{@html post.content}
	</div>
</article>
