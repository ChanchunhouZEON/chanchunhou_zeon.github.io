<script lang="ts">
  import type { PageData } from './$types';
  import { enhance } from '$app/forms';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>Blog Posts - Admin</title>
</svelte:head>

<div>
  <div class="mb-8 flex items-center justify-between">
    <div>
      <h1 class="mb-2 text-2xl font-bold text-slate-100">Blog Posts</h1>
      <p class="text-slate-500">{data.posts.length} posts total</p>
    </div>
    <a href="/posts/new" class="btn-primary">+ New Post</a>
  </div>

  <div class="glass overflow-hidden">
    <table class="data-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Category</th>
          <th>Date</th>
          <th>Tags</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each data.posts as post}
          <tr>
            <td class="font-medium text-slate-200">{post.title}</td>
            <td><span class="tag">{post.category}</span></td>
            <td class="text-slate-500">{post.date}</td>
            <td>
              <div class="flex flex-wrap gap-1">
                {#each post.tags.slice(0, 2) as tag}
                  <span class="tag">{tag}</span>
                {/each}
                {#if post.tags.length > 2}
                  <span class="tag">+{post.tags.length - 2}</span>
                {/if}
              </div>
            </td>
            <td>
              <div class="flex items-center gap-2">
                <a href="/posts/{post.slug}" class="btn-secondary btn-sm">Edit</a>
                <form method="POST" action="?/delete" use:enhance>
                  <input type="hidden" name="slug" value={post.slug} />
                  <button type="submit" class="btn-danger btn-sm" onclick={(e) => { if (!confirm('Delete this post?')) e.preventDefault(); }}>Delete</button>
                </form>
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
