<script lang="ts">
	import { base } from '$app/paths';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const post = data.post;
	const category = data.category;

	const fontSizes = [
		{ label: 'S', value: 12 },
		{ label: 'M', value: 14 },
		{ label: 'L', value: 16 },
		{ label: 'XL', value: 18 }
	];
	let fontSize = $state(14);
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
		<div class="mb-4 flex items-center justify-between">
			<div class="flex items-center gap-3 text-sm text-slate-400">
				<time>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time>
				<span class="text-slate-300 dark:text-slate-600">/</span>
				<span>{post.readingTime} read</span>
			</div>
			<!-- Font size selector -->
			<div class="flex items-center gap-1.5">
				<span class="mr-1 text-xs text-slate-500">
					<svg xmlns="http://www.w3.org/2000/svg" class="inline h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg>
				</span>
				{#each fontSizes as s}
					<button
						type="button"
						class="rounded-md px-2 py-0.5 text-xs font-medium transition-all {fontSize === s.value ? 'bg-accent/15 text-accent dark:text-accent-cyan' : 'text-slate-500 hover:text-slate-300'}"
						onclick={() => fontSize = s.value}
					>
						{s.label}
					</button>
				{/each}
			</div>
		</div>
		<h1 class="mb-6 text-3xl font-extrabold leading-[1.2] tracking-tight md:text-4xl lg:text-[2.75rem]">{post.title}</h1>
		<div class="flex flex-wrap gap-2">
			{#each post.tags as tag}
				<span class="tag !px-3 !py-1 !text-sm">{tag}</span>
			{/each}
		</div>
	</header>

	<div class="blog-prose" style="font-size: {fontSize}pt;">
		{@html post.content}
	</div>
</article>
