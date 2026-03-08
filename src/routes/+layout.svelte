<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { base } from '$app/paths';
	import { profile } from '$lib/data/profile';
	import '../app.css';

	let { children }: { children: Snippet } = $props();

	let scrolled = $state(false);
	let mobileOpen = $state(false);
	let dark = $state(true);

	const navLinks = [
		{ name: 'About', href: `${base}/#about` },
		{ name: 'Stack', href: `${base}/#stack` },
		{ name: 'Projects', href: `${base}/projects` },
		{ name: 'Blog', href: `${base}/blog` }
	];

	onMount(() => {
		dark = localStorage.getItem('theme') !== 'light';
		document.documentElement.classList.toggle('dark', dark);
		const onScroll = () => (scrolled = window.scrollY > 50);
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});

	function toggleTheme() {
		dark = !dark;
		localStorage.setItem('theme', dark ? 'dark' : 'light');
		document.documentElement.classList.toggle('dark', dark);
	}
</script>

<nav
	class="fixed top-0 z-50 w-full nav-liquid-glass transition-all duration-500
		{scrolled ? 'nav-liquid-glass--scrolled' : ''}"
>
	<div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
		<a href="{base}/" class="text-xl font-bold gradient-text">{profile.name}</a>

		<div class="hidden items-center gap-2 md:flex">
			{#each navLinks as link}
				<a href={link.href} class="nav-link">{link.name}</a>
			{/each}
		</div>

		<div class="flex items-center gap-3">
			<button onclick={toggleTheme} class="btn-icon" aria-label="Toggle theme">
				{#if dark}
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
				{:else}
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
				{/if}
			</button>
			<button onclick={() => (mobileOpen = !mobileOpen)} class="btn-icon md:hidden" aria-label="Menu">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					{#if mobileOpen}
						<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
					{:else}
						<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
					{/if}
				</svg>
			</button>
		</div>
	</div>

	{#if mobileOpen}
		<div class="nav-liquid-glass nav-liquid-glass--scrolled border-b border-white/20 dark:border-white/5 md:hidden">
			{#each navLinks as link}
				<a href={link.href} onclick={() => (mobileOpen = false)} class="block px-6 py-3 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">{link.name}</a>
			{/each}
		</div>
	{/if}
</nav>

<main class="min-h-screen">{@render children()}</main>

<footer class="border-t border-slate-200/60 bg-slate-100/50 dark:border-slate-800/30 dark:bg-slate-900">
	<div class="mx-auto max-w-6xl px-6 py-12">
		<div class="flex flex-col items-center justify-between gap-6 md:flex-row">
			<div>
				<p class="text-lg font-semibold gradient-text">{profile.name}</p>
				<p class="mt-1 text-sm text-slate-400">{profile.title}</p>
			</div>
			<div class="flex items-center gap-4">
				<a href={profile.github} target="_blank" rel="noopener" class="btn-icon !p-2" aria-label="GitHub"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg></a>
				<a href={profile.linkedin} target="_blank" rel="noopener" class="btn-icon !p-2" aria-label="LinkedIn"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
				<a href={profile.twitter} target="_blank" rel="noopener" class="btn-icon !p-2" aria-label="Twitter"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
				<a href="mailto:{profile.email}" class="btn-icon !p-2" aria-label="Email"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg></a>
			</div>
		</div>
		<div class="mt-8 border-t border-slate-200/40 pt-8 text-center text-sm text-slate-400 dark:border-slate-800/30">
			<p>&copy; {new Date().getFullYear()} {profile.name}. Built with Svelte & TailwindCSS.</p>
		</div>
	</div>
</footer>
