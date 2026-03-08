<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { profile } from '$lib/data/profile';
	import { techStack } from '$lib/data/techStack';
	import { projects } from '$lib/data/projects';
	import { reveal, spotlight, magnetic } from '$lib/utils/reveal';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let mounted = $state(false);
	let statValues = $state(profile.stats.map(() => 0));

	// Hero typewriter state
	let typedText = $state('');
	let heroBio = $state('');
	let heroBioDone = $state(false);
	let heroBioStarted = $state(false);

	const featuredProjects = projects.filter((p) => p.featured);
	const latestPosts = data.latestPosts;

	function animateCountUp(target: number, index: number) {
		const duration = 2000;
		const start = performance.now();
		function step(now: number) {
			const progress = Math.min((now - start) / duration, 1);
			const eased = 1 - Math.pow(1 - progress, 3);
			statValues[index] = Math.round(eased * target);
			if (progress < 1) requestAnimationFrame(step);
		}
		requestAnimationFrame(step);
	}

	function statSuffix(val: string): string {
		return val.replace(/[\d]/g, '');
	}

	onMount(() => {
		mounted = true;

		let timeout: ReturnType<typeof setTimeout>;
		const bioText = profile.bio;

		// Bio shell typewriter first, then role cycling
		let bioTimeout: ReturnType<typeof setTimeout>;

		function startRoleCycling() {
			const roles = profile.roles;
			let roleIdx = 0, charIdx = 0, deleting = false;
			function tick() {
				const role = roles[roleIdx];
				if (!deleting) {
					charIdx++;
					typedText = role.slice(0, charIdx);
					if (charIdx === role.length) { timeout = setTimeout(() => { deleting = true; tick(); }, 2000); return; }
					timeout = setTimeout(tick, 80);
				} else {
					charIdx--;
					typedText = role.slice(0, charIdx);
					if (charIdx === 0) { deleting = false; roleIdx = (roleIdx + 1) % roles.length; }
					timeout = setTimeout(tick, 40);
				}
			}
			tick();
		}

		// Show cursor right after name brush animation completes (~2.9s), then start typing
		bioTimeout = setTimeout(() => {
			heroBioStarted = true;
			bioTimeout = setTimeout(() => {
				let j = 0;
				function typeBio() {
					if (j < bioText.length) {
						heroBio = bioText.slice(0, ++j);
						bioTimeout = setTimeout(typeBio, 14);
					} else {
						heroBioDone = true;
						startRoleCycling();
					}
				}
				typeBio();
			}, 400);
		}, 2900);

		const statsEl = document.getElementById('stats-grid');
		if (statsEl) {
			const obs = new IntersectionObserver(([e]) => {
				if (e.isIntersecting) { profile.stats.forEach((s, i) => animateCountUp(parseInt(s.value.replace(/\D/g, '')), i)); obs.disconnect(); }
			}, { threshold: 0.3 });
			obs.observe(statsEl);
		}

		return () => { clearTimeout(timeout); clearTimeout(bioTimeout); };
	});
</script>

<svelte:head>
	<title>{profile.name} - {profile.title}</title>
	<meta name="description" content={profile.bio} />
</svelte:head>

<!-- ===== HERO ===== -->
<section class="relative flex min-h-screen items-center justify-center overflow-hidden">
	<!-- Aurora background -->
	<div class="aurora-bg"></div>

	<!-- Grid overlay -->
	<div class="pointer-events-none absolute inset-0 bg-grid opacity-30"></div>

	<!-- Particles -->
	{#if mounted}
		<div class="pointer-events-none absolute inset-0 overflow-hidden">
			{#each Array(14) as _, i}
				<div
					class="particle"
					style="
						left: {6 + i * 6.5}%;
						bottom: -{5 + (i % 3) * 8}%;
						width: {2 + (i % 4) * 1.5}px;
						height: {2 + (i % 4) * 1.5}px;
						background: {i % 3 === 0 ? 'rgba(130,170,255,0.4)' : i % 3 === 1 ? 'rgba(137,221,255,0.3)' : 'rgba(199,146,234,0.3)'};
						animation-duration: {5 + (i % 6) * 2}s;
						animation-delay: {i * 0.5}s;
					"
				></div>
			{/each}
		</div>
	{/if}

	<!-- Content -->
	<div class="relative z-10 mx-auto max-w-4xl px-6 text-center">
		<p class="section-label !mb-4 !text-lg" style="animation: tilt-in 0.8s cubic-bezier(0.16,1,0.3,1) both 0.2s;">Hi, I'm</p>

		<h1 class="mb-6 text-5xl font-extrabold leading-tight tracking-tight md:text-7xl lg:text-8xl">
			<span class="hero-name-brush">{profile.name}</span>
		</h1>

		<div class="mb-8 flex h-10 items-center justify-center text-xl text-slate-400 md:text-2xl lg:text-3xl dark:text-slate-300 transition-opacity duration-500" style="opacity: {heroBioDone ? 1 : 0};">
			<span>{typedText}</span>
			<span class="ml-0.5 animate-blink text-accent">|</span>
		</div>

		<p class="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-slate-400 md:text-lg transition-opacity duration-500" style="opacity: {heroBioStarted ? 1 : 0};">
			{heroBio}{#if heroBioStarted && !heroBioDone}<span class="shell-cursor"></span>{/if}
		</p>

		<!-- CTA Buttons -->
		<div class="mb-12 flex flex-wrap justify-center gap-4" style="animation: tilt-in 0.8s cubic-bezier(0.16,1,0.3,1) both 2.8s;">
			<a href="{base}/projects" class="btn-primary" use:magnetic={0.2}>
				<span>View Projects</span>
			</a>
			<a href="{base}/blog" class="btn-secondary" use:magnetic={0.2}>
				<span>Read Blog</span>
			</a>
		</div>

		<!-- Social icons -->
		<div class="flex justify-center gap-4" style="animation: tilt-in 0.8s cubic-bezier(0.16,1,0.3,1) both 3.1s;">
			<a href={profile.github} target="_blank" rel="noopener" class="btn-icon" aria-label="GitHub">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
			</a>
			<a href={profile.linkedin} target="_blank" rel="noopener" class="btn-icon" aria-label="LinkedIn">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
			</a>
			<a href={profile.twitter} target="_blank" rel="noopener" class="btn-icon" aria-label="Twitter">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
			</a>
		</div>
	</div>

	<!-- Scroll indicator -->
	<div class="absolute bottom-8 left-1/2 -translate-x-1/2">
		<div class="flex h-10 w-6 justify-center rounded-full border-2 border-slate-300/30 dark:border-slate-600/30">
			<div class="mt-2 h-2 w-1 animate-bounce rounded-full bg-accent/50"></div>
		</div>
	</div>
</section>

<div class="section-divider"></div>

<!-- ===== ABOUT ===== -->
<section id="about" class="relative overflow-hidden py-32">
	<div class="pointer-events-none absolute -right-32 top-0 h-[300px] w-[300px] rounded-full bg-accent/5 blur-[80px] animate-drift"></div>

	<div class="mx-auto max-w-6xl px-6">
		<div use:reveal={{ direction: 'left' }}>
			<p class="section-label">About</p>
			<h2 class="mb-6 text-3xl font-bold md:text-4xl">
				A bit about <span class="gradient-text">me</span>
			</h2>
			<p class="mb-12 max-w-3xl text-lg leading-relaxed text-slate-500 dark:text-slate-400">
				{profile.bio}
				I'm based in {profile.location} and always exploring new technologies.
				When I'm not coding, you can find me contributing to open source,
				writing technical articles, or experimenting with the latest frameworks.
			</p>
		</div>

		<div id="stats-grid" class="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
			{#each profile.stats as stat, i}
				<div use:reveal={{ delay: i * 120, direction: 'scale' }} use:spotlight class="glass rounded-2xl p-6 text-center">
					<p class="text-3xl font-extrabold gradient-text md:text-4xl">{statValues[i]}{statSuffix(stat.value)}</p>
					<p class="mt-1 text-sm text-slate-400">{stat.label}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<div class="section-divider"></div>

<!-- ===== TECH STACK ===== -->
<section id="stack" class="relative overflow-hidden py-32">
	<div class="pointer-events-none absolute inset-0 bg-slate-50/30 dark:bg-slate-900/15"></div>
	<div class="pointer-events-none absolute -left-40 bottom-10 h-[250px] w-[250px] rounded-full bg-accent-purple/5 blur-[80px] animate-drift" style="animation-delay: -5s;"></div>

	<div class="relative mx-auto max-w-6xl px-6">
		<div use:reveal={{ direction: 'right' }}>
			<p class="section-label">Tech Stack</p>
			<h2 class="mb-12 text-3xl font-bold md:text-4xl">
				Technologies I <span class="gradient-text">work with</span>
			</h2>
		</div>

		<div class="space-y-10">
			{#each techStack as category, ci}
				<div use:reveal={{ delay: ci * 120, direction: ci % 2 === 0 ? 'left' : 'right' }}>
					<h3 class="mb-4 text-lg font-semibold text-slate-600 dark:text-slate-300">{category.name}</h3>
					<div class="flex flex-wrap gap-3">
						{#each category.items as tech, ti}
							<span class="shimmer-pill glass group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium" style="transition-delay: {ti * 50}ms;">
								<span class="inline-block h-2.5 w-2.5 rounded-full transition-all duration-300 group-hover:scale-150" style="background-color: {tech.color}; box-shadow: 0 0 0 rgba({tech.color}, 0);"></span>
								{tech.name}
							</span>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<div class="section-divider"></div>

<!-- ===== PROJECTS ===== -->
<section id="projects" class="relative overflow-hidden py-32">
	<div class="pointer-events-none absolute right-10 top-20 h-[200px] w-[200px] rounded-full bg-accent-coral/5 blur-[60px] animate-drift" style="animation-delay: -3s;"></div>

	<div class="mx-auto max-w-6xl px-6">
		<div use:reveal={{ direction: 'left' }}>
			<p class="section-label">Projects</p>
			<h2 class="mb-4 text-3xl font-bold md:text-4xl">
				Featured <span class="gradient-text">projects</span>
			</h2>
			<p class="mb-12 text-slate-400">A selection of my recent work. View all on the <a href="{base}/projects" class="text-accent underline decoration-accent/30 underline-offset-4 transition-colors hover:decoration-accent">projects page</a>.</p>
		</div>

		<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each featuredProjects as project, i}
				<div use:reveal={{ delay: i * 130, direction: 'tilt' }} use:spotlight class="card-3d glass group flex flex-col rounded-2xl p-6">
					<div class="relative z-10 mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/8 text-accent dark:bg-accent/10 dark:text-accent-cyan">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 8-4 4 4 4"/><path d="m17 8 4 4-4 4"/><path d="m14 4-4 16"/></svg>
					</div>
					<h3 class="relative z-10 mb-2 text-lg font-bold transition-colors group-hover:text-accent dark:group-hover:text-accent-cyan">{project.title}</h3>
					<p class="relative z-10 mb-4 flex-1 text-sm leading-relaxed text-slate-400">{project.description}</p>
					<div class="relative z-10 mb-4 flex flex-wrap gap-2">
						{#each project.tech as t}
							<span class="tag-muted">{t}</span>
						{/each}
					</div>
					<div class="relative z-10 flex gap-4">
						{#if project.github}
							<a href={project.github} target="_blank" rel="noopener" class="text-sm text-slate-400 transition-colors hover:text-accent dark:hover:text-accent-cyan">GitHub &rarr;</a>
						{/if}
						{#if project.demo}
							<a href={project.demo} target="_blank" rel="noopener" class="text-sm text-slate-400 transition-colors hover:text-accent dark:hover:text-accent-cyan">Live Demo &rarr;</a>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<div class="section-divider"></div>

<!-- ===== BLOG ===== -->
<section id="blog" class="relative overflow-hidden py-32">
	<div class="pointer-events-none absolute inset-0 bg-slate-50/30 dark:bg-slate-900/15"></div>
	<div class="pointer-events-none absolute -left-20 top-40 h-[250px] w-[250px] rounded-full bg-accent-green/5 blur-[80px] animate-drift" style="animation-delay: -8s;"></div>

	<div class="relative mx-auto max-w-6xl px-6">
		<div use:reveal={{ direction: 'right' }}>
			<p class="section-label">Blog</p>
			<h2 class="mb-4 text-3xl font-bold md:text-4xl">
				Latest <span class="gradient-text">articles</span>
			</h2>
			<p class="mb-12 text-slate-400">Thoughts on development, tooling, and the modern web.</p>
		</div>

		<div class="grid gap-6 md:grid-cols-3">
			{#each latestPosts as post, i}
				<a
					href="{base}/blog/{post.category}/{post.slug}"
					use:reveal={{ delay: i * 130, direction: i === 0 ? 'left' : i === 2 ? 'right' : 'up' }}
					use:spotlight
					class="glass group flex flex-col rounded-2xl p-6"
				>
					<div class="relative z-10 mb-3 flex items-center gap-3 text-xs text-slate-400">
						<time>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</time>
						<span>&middot;</span>
						<span>{post.readingTime}</span>
					</div>
					<h3 class="relative z-10 mb-2 text-lg font-bold transition-colors group-hover:text-accent dark:group-hover:text-accent-cyan">{post.title}</h3>
					<p class="relative z-10 mb-4 flex-1 text-sm leading-relaxed text-slate-400">{post.excerpt}</p>
					<div class="relative z-10 flex flex-wrap gap-2">
						{#each post.tags as tag}
							<span class="tag">{tag}</span>
						{/each}
					</div>
				</a>
			{/each}
		</div>

		<div use:reveal class="mt-10 text-center">
			<a href="{base}/blog" class="inline-flex items-center gap-2 text-sm font-medium text-accent transition-colors hover:text-accent-cyan">View all articles &rarr;</a>
		</div>
	</div>
</section>

<div class="section-divider"></div>

<!-- ===== CONTACT ===== -->
<section id="contact" class="relative overflow-hidden py-32">
	<div class="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/5 blur-[100px] animate-pulse-soft"></div>

	<div class="relative mx-auto max-w-3xl px-6 text-center">
		<div use:reveal={{ direction: 'scale' }}>
			<p class="section-label">Contact</p>
			<h2 class="mb-6 text-3xl font-bold md:text-4xl">
				Let's <span class="gradient-text">connect</span>
			</h2>
			<p class="mb-10 text-lg text-slate-400">Have an idea or want to collaborate? I'd love to hear from you.</p>
			<a href="mailto:{profile.email}" class="btn-primary inline-flex items-center gap-2 !px-10 !py-4 !text-lg" use:magnetic={0.15}>
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
				<span>Say Hello</span>
			</a>
		</div>
	</div>
</section>
