<script lang="ts">
  import type { PageData } from './$types';
  import { enhance } from '$app/forms';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>Blog Categories - Admin</title>
</svelte:head>

<div>
  <div class="mb-8 flex items-center justify-between">
    <div>
      <h1 class="mb-2 text-2xl font-bold text-slate-100">Blog Categories</h1>
      <p class="text-slate-500">{data.categories.length} categories</p>
    </div>
    <a href="/categories/new" class="btn-primary">+ New Category</a>
  </div>

  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {#each data.categories as cat}
      <div class="glass p-5">
        <div class="mb-3 flex items-center justify-between">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
            {@html cat.icon}
          </div>
          <span class="tag">{cat.slug}</span>
        </div>
        <h3 class="mb-1 font-semibold text-slate-200">{cat.name}</h3>
        <p class="mb-4 text-sm text-slate-500">{cat.description}</p>
        <div class="flex gap-2">
          <a href="/categories/{cat.slug}" class="btn-secondary btn-sm">Edit</a>
          <form method="POST" action="?/delete" use:enhance>
            <input type="hidden" name="slug" value={cat.slug} />
            <button type="submit" class="btn-danger btn-sm" onclick={(e) => { if (!confirm('Delete this category?')) e.preventDefault(); }}>Delete</button>
          </form>
        </div>
      </div>
    {/each}
  </div>
</div>
