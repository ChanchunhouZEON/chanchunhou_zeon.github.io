<script lang="ts">
  import type { Snippet } from 'svelte';
  import { page } from '$app/stores';
  import '../app.css';

  let { children }: { children: Snippet } = $props();

  const navLinks = [
    { name: 'Dashboard', href: '/', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1' },
    { name: 'Profile', href: '/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { name: 'Tech Stack', href: '/tech-stack', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
    { name: 'Projects', href: '/projects', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
    { name: 'Categories', href: '/categories', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
    { name: 'Posts', href: '/posts', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' }
  ];
</script>

<div class="flex min-h-screen">
  <!-- Sidebar -->
  <aside class="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col border-r border-white/5 bg-slate-950/80 backdrop-blur-xl">
    <div class="flex h-16 items-center px-5 border-b border-white/5">
      <h1 class="text-lg font-bold gradient-text">Admin Panel</h1>
    </div>
    <nav class="flex-1 overflow-y-auto p-3 space-y-1">
      {#each navLinks as link}
        <a
          href={link.href}
          class="sidebar-link"
          class:active={$page.url.pathname === link.href || ($page.url.pathname.startsWith(link.href) && link.href !== '/')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d={link.icon} />
          </svg>
          <span>{link.name}</span>
        </a>
      {/each}
    </nav>
    <div class="border-t border-white/5 p-3">
      <p class="text-xs text-slate-600 text-center">Site CMS v1.0</p>
    </div>
  </aside>

  <!-- Main content -->
  <main class="ml-60 flex-1 p-8">
    {@render children()}
  </main>
</div>
