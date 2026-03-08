<script lang="ts">
	import { reveal } from '$lib/utils/reveal';
	import type { Snippet } from 'svelte';

	let {
		label,
		subtitle,
		children
	}: { label: string; subtitle: string; children: Snippet } = $props();
</script>

<div use:reveal>
	<p class="section-label">{label}</p>
	<h1 class="mb-4 text-4xl font-bold md:text-5xl">{@render children()}</h1>
	<p class="mb-12 text-lg text-slate-400">{subtitle}</p>
</div>
