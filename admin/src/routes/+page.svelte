<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>Dashboard - Admin</title>
</svelte:head>

<div>
  <h1 class="mb-2 text-2xl font-bold text-slate-100">Dashboard</h1>
  <p class="mb-8 text-slate-500">Welcome back, {data.profileName}.</p>

  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
    <div class="glass stat-card">
      <p class="stat-value">{data.stats.projects}</p>
      <p class="stat-label">Projects</p>
    </div>
    <div class="glass stat-card">
      <p class="stat-value">{data.stats.techItems}</p>
      <p class="stat-label">Tech Items</p>
    </div>
    <div class="glass stat-card">
      <p class="stat-value">{data.stats.categories}</p>
      <p class="stat-label">Blog Categories</p>
    </div>
    <div class="glass stat-card">
      <p class="stat-value">{data.stats.posts}</p>
      <p class="stat-label">Blog Posts</p>
    </div>
  </div>

  <div class="glass p-6">
    <h2 class="mb-4 text-lg font-semibold text-slate-200">Recent Posts</h2>
    {#if data.recentPosts.length === 0}
      <p class="text-sm text-slate-500">No posts yet.</p>
    {:else}
      <table class="data-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {#each data.recentPosts as post}
            <tr>
              <td><a href="/posts/{post.slug}" class="text-accent hover:underline">{post.title}</a></td>
              <td><span class="tag">{post.category}</span></td>
              <td class="text-slate-500">{post.date}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </div>
</div>
