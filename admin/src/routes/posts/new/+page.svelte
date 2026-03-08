<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head>
  <title>New Post - Admin</title>
</svelte:head>

<div>
  <a href="/posts" class="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-accent">&larr; Back to Posts</a>
  <h1 class="mb-8 text-2xl font-bold text-slate-100">New Post</h1>

  <form method="POST" use:enhance class="space-y-5">
    <div class="glass p-6 space-y-5">
      <div class="grid gap-5 md:grid-cols-2">
        <div>
          <label for="title" class="form-label">Title</label>
          <input id="title" name="title" class="form-input" required />
        </div>
        <div>
          <label for="slug" class="form-label">Slug (auto-generated if empty)</label>
          <input id="slug" name="slug" class="form-input" placeholder="auto-generated" />
        </div>
      </div>
      <div class="grid gap-5 md:grid-cols-3">
        <div>
          <label for="date" class="form-label">Date</label>
          <input id="date" name="date" type="date" class="form-input" value={new Date().toISOString().split('T')[0]} />
        </div>
        <div>
          <label for="category" class="form-label">Category</label>
          <select id="category" name="category" class="form-input">
            <option value="">Select...</option>
            {#each data.categories as cat}
              <option value={cat.slug}>{cat.name}</option>
            {/each}
          </select>
        </div>
        <div>
          <label for="tags" class="form-label">Tags (comma-separated)</label>
          <input id="tags" name="tags" class="form-input" />
        </div>
      </div>
      <div>
        <label for="excerpt" class="form-label">Excerpt</label>
        <textarea id="excerpt" name="excerpt" class="form-input" rows="2"></textarea>
      </div>
    </div>

    <div class="glass p-6">
      <label for="content" class="form-label">Content (Markdown)</label>
      <textarea id="content" name="content" class="form-input font-mono text-xs" rows="20" placeholder="Write your post in Markdown..."></textarea>
    </div>

    {#if form?.error}<p class="text-sm text-accent-red">{form.error}</p>{/if}
    <button type="submit" class="btn-primary">Create Post</button>
  </form>
</div>
