<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';

  let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
  <title>New Project - Admin</title>
</svelte:head>

<div>
  <a href="/projects" class="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-accent">&larr; Back to Projects</a>
  <h1 class="mb-8 text-2xl font-bold text-slate-100">New Project</h1>

  <form method="POST" use:enhance class="glass p-6 space-y-5">
    <div>
      <label for="title" class="form-label">Title</label>
      <input id="title" name="title" class="form-input" required />
    </div>
    <div>
      <label for="description" class="form-label">Description</label>
      <textarea id="description" name="description" class="form-input" rows="3"></textarea>
    </div>
    <div>
      <label for="tech" class="form-label">Tech (comma-separated)</label>
      <input id="tech" name="tech" class="form-input" placeholder="React, TypeScript, Go" />
    </div>
    <div class="grid gap-5 md:grid-cols-2">
      <div>
        <label for="github" class="form-label">GitHub URL</label>
        <input id="github" name="github" class="form-input" />
      </div>
      <div>
        <label for="demo" class="form-label">Demo URL</label>
        <input id="demo" name="demo" class="form-input" />
      </div>
    </div>
    <div class="flex items-center gap-2">
      <input type="checkbox" id="featured" name="featured" class="form-checkbox" />
      <label for="featured" class="text-sm text-slate-400">Featured project</label>
    </div>
    {#if form?.error}<p class="text-sm text-accent-red">{form.error}</p>{/if}
    <button type="submit" class="btn-primary">Create Project</button>
  </form>
</div>
