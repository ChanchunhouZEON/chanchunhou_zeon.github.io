<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();
  let stackJson = $state(JSON.stringify(data.techStack, null, 2));
  let showToast = $state(false);

  $effect(() => {
    if (form?.success) {
      showToast = true;
      setTimeout(() => showToast = false, 3000);
    }
  });
</script>

<svelte:head>
  <title>Tech Stack - Admin</title>
</svelte:head>

{#if showToast}
  <div class="toast toast-success">Tech stack saved</div>
{/if}

<div>
  <h1 class="mb-2 text-2xl font-bold text-slate-100">Tech Stack</h1>
  <p class="mb-8 text-slate-500">Edit the full tech stack as JSON. Each category has a name and items array.</p>

  <form method="POST" action="?/save" use:enhance class="glass p-6 space-y-5">
    <div>
      <label for="stack" class="form-label">Tech Stack JSON</label>
      <textarea id="stack" name="stack" class="form-input font-mono text-xs" rows="25" bind:value={stackJson}></textarea>
    </div>
    {#if form?.error}<p class="text-sm text-accent-red">{form.error}</p>{/if}
    <button type="submit" class="btn-primary">Save Tech Stack</button>
  </form>

  <div class="mt-8 glass p-6">
    <h2 class="mb-4 text-lg font-semibold text-slate-200">Preview</h2>
    {#each data.techStack as category}
      <div class="mb-4">
        <h3 class="mb-2 text-sm font-semibold text-slate-400">{category.name}</h3>
        <div class="flex flex-wrap gap-2">
          {#each category.items as item}
            <span class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm" style="background: {item.color}15; border: 1px solid {item.color}30; color: {item.color}">
              <span class="h-2 w-2 rounded-full" style="background: {item.color}"></span>
              {item.name}
            </span>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</div>
