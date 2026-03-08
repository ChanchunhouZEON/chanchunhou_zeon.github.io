<script lang="ts">
  import type { PageData } from './$types';
  import { enhance } from '$app/forms';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>Projects - Admin</title>
</svelte:head>

<div>
  <div class="mb-8 flex items-center justify-between">
    <div>
      <h1 class="mb-2 text-2xl font-bold text-slate-100">Projects</h1>
      <p class="text-slate-500">{data.projects.length} projects total</p>
    </div>
    <a href="/projects/new" class="btn-primary">+ New Project</a>
  </div>

  <div class="glass overflow-hidden">
    <table class="data-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Tech</th>
          <th>Featured</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each data.projects as project}
          <tr>
            <td class="font-medium text-slate-200">{project.title}</td>
            <td>
              <div class="flex flex-wrap gap-1">
                {#each project.tech.slice(0, 3) as t}
                  <span class="tag">{t}</span>
                {/each}
                {#if project.tech.length > 3}
                  <span class="tag">+{project.tech.length - 3}</span>
                {/if}
              </div>
            </td>
            <td>
              {#if project.featured}
                <span class="text-accent-green text-sm">Yes</span>
              {:else}
                <span class="text-slate-600 text-sm">No</span>
              {/if}
            </td>
            <td>
              <div class="flex items-center gap-2">
                <a href="/projects/{project.id}" class="btn-secondary btn-sm">Edit</a>
                <form method="POST" action="?/delete" use:enhance>
                  <input type="hidden" name="id" value={project.id} />
                  <button type="submit" class="btn-danger btn-sm" onclick={(e) => { if (!confirm('Delete this project?')) e.preventDefault(); }}>Delete</button>
                </form>
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
