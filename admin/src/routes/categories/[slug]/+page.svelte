<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();
  const cat = data.category;
</script>

<svelte:head>
  <title>Edit {cat.name} - Admin</title>
</svelte:head>

<div>
  <a href="/categories" class="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-accent">&larr; Back to Categories</a>
  <h1 class="mb-8 text-2xl font-bold text-slate-100">Edit Category</h1>

  <form method="POST" use:enhance class="glass p-6 space-y-5">
    <div>
      <label for="name" class="form-label">Name</label>
      <input id="name" name="name" class="form-input" value={cat.name} required />
    </div>
    <div>
      <label for="description" class="form-label">Description</label>
      <textarea id="description" name="description" class="form-input" rows="2">{cat.description}</textarea>
    </div>
    <div>
      <label for="icon" class="form-label">Icon SVG</label>
      <textarea id="icon" name="icon" class="form-input font-mono text-xs" rows="3">{cat.icon}</textarea>
    </div>
    {#if form?.error}<p class="text-sm text-accent-red">{form.error}</p>{/if}
    <button type="submit" class="btn-primary">Save Changes</button>
  </form>
</div>
