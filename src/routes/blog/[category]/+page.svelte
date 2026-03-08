<script lang="ts">
	import { base } from '$app/paths';
	import { reveal, spotlight } from '$lib/utils/reveal';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const posts = data.posts;
	const category = data.category;
</script>

<svelte:head>
	<title>{category.name} - Blog</title>
</svelte:head>

<div class="mx-auto max-w-4xl px-6 pt-32 pb-20">
	<a href="{base}/blog" class="mb-8 inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-accent dark:hover:text-accent-cyan" use:reveal>
		<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
		All categories
	</a>

	<PageHeader label="Blog" subtitle={category.description}>
		<span class="gradient-text">{category.name}</span>
	</PageHeader>

	<div class="space-y-6">
		{#each posts as post, i}
			<a
				href="{base}/blog/{category.slug}/{post.slug}"
				use:reveal={{ delay: i * 80, direction: i % 2 === 0 ? 'left' : 'right' }}
				use:spotlight
				class="glass group block rounded-2xl p-6"
			>
				<div class="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<div class="flex-1">
						<div class="mb-2 flex items-center gap-3 text-xs text-slate-400">
							<time>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</time>
							<span>&middot;</span>
							<span>{post.readingTime}</span>
						</div>
						<h2 class="mb-2 text-xl font-bold transition-colors group-hover:text-accent dark:group-hover:text-accent-cyan">{post.title}</h2>
						<p class="text-sm text-slate-400">{post.excerpt}</p>
					</div>
					<div class="flex flex-wrap gap-2 md:flex-shrink-0">
						{#each post.tags as tag}
							<span class="tag">{tag}</span>
						{/each}
					</div>
				</div>
			</a>
		{/each}
	</div>
</div>
