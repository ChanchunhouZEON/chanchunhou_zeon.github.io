<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();
  const post = data.post;
</script>

<svelte:head>
  <title>Edit {post.title} - Admin</title>
</svelte:head>

<div>
  <a href="/posts" class="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-accent">&larr; Back to Posts</a>
  <h1 class="mb-8 text-2xl font-bold text-slate-100">Edit Post</h1>

  <form method="POST" use:enhance class="space-y-5">
    <div class="glass p-6 space-y-5">
      <div>
        <label for="title" class="form-label">Title</label>
        <input id="title" name="title" class="form-input" value={post.title} required />
      </div>
      <div class="grid gap-5 md:grid-cols-3">
        <div>
          <label for="date" class="form-label">Date</label>
          <input id="date" name="date" type="date" class="form-input" value={post.date} />
        </div>
        <div>
          <label for="category" class="form-label">Category</label>
          <select id="category" name="category" class="form-input">
            <option value="">Select...</option>
            {#each data.categories as cat}
              <option value={cat.slug} selected={cat.slug === post.category}>{cat.name}</option>
            {/each}
          </select>
        </div>
        <div>
          <label for="tags" class="form-label">Tags (comma-separated)</label>
          <input id="tags" name="tags" class="form-input" value={post.tags.join(', ')} />
        </div>
      </div>
      <div>
        <label for="excerpt" class="form-label">Excerpt</label>
        <textarea id="excerpt" name="excerpt" class="form-input" rows="2">{post.excerpt}</textarea>
      </div>
    </div>

    <div class="glass p-6">
      <label for="content" class="form-label">Content (Markdown)</label>
      <textarea id="content" name="content" class="form-input font-mono text-xs" rows="20">{post.content}</textarea>
    </div>

    {#if form?.error}<p class="text-sm text-accent-red">{form.error}</p>{/if}
    <button type="submit" class="btn-primary">Save Changes</button>
  </form>
</div>
