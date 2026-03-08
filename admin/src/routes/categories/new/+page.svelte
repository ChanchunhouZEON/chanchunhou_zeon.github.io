<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';

  let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
  <title>New Category - Admin</title>
</svelte:head>

<div>
  <a href="/categories" class="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-accent">&larr; Back to Categories</a>
  <h1 class="mb-8 text-2xl font-bold text-slate-100">New Category</h1>

  <form method="POST" use:enhance class="glass p-6 space-y-5">
    <div class="grid gap-5 md:grid-cols-2">
      <div>
        <label for="name" class="form-label">Name</label>
        <input id="name" name="name" class="form-input" required />
      </div>
      <div>
        <label for="slug" class="form-label">Slug (auto-generated if empty)</label>
        <input id="slug" name="slug" class="form-input" placeholder="auto-generated" />
      </div>
    </div>
    <div>
      <label for="description" class="form-label">Description</label>
      <textarea id="description" name="description" class="form-input" rows="2"></textarea>
    </div>
    <div>
      <label for="icon" class="form-label">Icon SVG</label>
      <textarea id="icon" name="icon" class="form-input font-mono text-xs" rows="3" placeholder="<svg ...>...</svg>"></textarea>
    </div>
    {#if form?.error}<p class="text-sm text-accent-red">{form.error}</p>{/if}
    <button type="submit" class="btn-primary">Create Category</button>
  </form>
</div>
