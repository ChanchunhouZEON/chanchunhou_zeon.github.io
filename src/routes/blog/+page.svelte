<script lang="ts">
	import { base } from '$app/paths';
	import { reveal, spotlight } from '$lib/utils/reveal';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const categories = data.categories;
</script>

<svelte:head>
	<title>Blog - Articles on Development & Tech</title>
</svelte:head>

<div class="mx-auto max-w-6xl px-6 pt-32 pb-20">
	<PageHeader label="Blog" subtitle="Writing about web development, developer tools, and modern technologies.">
		All <span class="gradient-text">articles</span>
	</PageHeader>

	<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each categories as cat, i}
			<a
				href="{base}/blog/{cat.slug}"
				use:reveal={{ delay: i * 80, direction: 'tilt' }}
				use:spotlight
				class="card-3d glass group flex flex-col rounded-2xl p-6"
			>
				<div class="relative z-10 mb-4 flex items-center justify-between">
					<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/8 text-accent dark:bg-accent/10 dark:text-accent-cyan">
						{@html cat.icon}
					</div>
					<span class="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent dark:text-accent-cyan">
						{cat.postCount} {cat.postCount === 1 ? 'post' : 'posts'}
					</span>
				</div>
				<h2 class="relative z-10 mb-2 text-lg font-bold transition-colors group-hover:text-accent dark:group-hover:text-accent-cyan">{cat.name}</h2>
				<p class="relative z-10 mb-4 flex-1 text-sm leading-relaxed text-slate-400">{cat.description}</p>
				<div class="relative z-10 mb-4 flex flex-wrap gap-2">
					{#each cat.tags as tag}
						<span class="tag-muted">{tag}</span>
					{/each}
				</div>
				<div class="relative z-10 flex items-center gap-1.5 border-t border-slate-200/40 pt-4 text-sm text-slate-400 transition-colors group-hover:text-accent dark:border-slate-700/30 dark:group-hover:text-accent-cyan">
					<span>Explore articles</span>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
				</div>
			</a>
		{/each}
	</div>
</div>
