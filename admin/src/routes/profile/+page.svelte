<script lang="ts">
  import type { PageData, ActionData } from './$types';
  import { enhance } from '$app/forms';

  let { data, form }: { data: PageData; form: ActionData } = $props();
  let profile = $state({ ...data.profile });
  let statsJson = $state(JSON.stringify(data.profile.stats, null, 2));
  let showToast = $state(false);

  $effect(() => {
    if (form?.success) {
      showToast = true;
      setTimeout(() => showToast = false, 3000);
    }
  });
</script>

<svelte:head>
  <title>Profile - Admin</title>
</svelte:head>

{#if showToast}
  <div class="toast toast-success">Profile saved successfully</div>
{/if}

<div>
  <h1 class="mb-2 text-2xl font-bold text-slate-100">Profile</h1>
  <p class="mb-8 text-slate-500">Edit your personal information.</p>

  <form method="POST" use:enhance class="glass p-6 space-y-5">
    <div class="grid gap-5 md:grid-cols-2">
      <div>
        <label for="name" class="form-label">Name</label>
        <input id="name" name="name" class="form-input" value={profile.name} />
      </div>
      <div>
        <label for="title" class="form-label">Title</label>
        <input id="title" name="title" class="form-input" value={profile.title} />
      </div>
    </div>

    <div>
      <label for="roles" class="form-label">Roles (comma-separated)</label>
      <input id="roles" name="roles" class="form-input" value={profile.roles.join(', ')} />
    </div>

    <div>
      <label for="bio" class="form-label">Bio</label>
      <textarea id="bio" name="bio" class="form-input" rows="3">{profile.bio}</textarea>
    </div>

    <div class="grid gap-5 md:grid-cols-2">
      <div>
        <label for="email" class="form-label">Email</label>
        <input id="email" name="email" type="email" class="form-input" value={profile.email} />
      </div>
      <div>
        <label for="location" class="form-label">Location</label>
        <input id="location" name="location" class="form-input" value={profile.location} />
      </div>
    </div>

    <div class="grid gap-5 md:grid-cols-3">
      <div>
        <label for="github" class="form-label">GitHub URL</label>
        <input id="github" name="github" class="form-input" value={profile.github} />
      </div>
      <div>
        <label for="linkedin" class="form-label">LinkedIn URL</label>
        <input id="linkedin" name="linkedin" class="form-input" value={profile.linkedin} />
      </div>
      <div>
        <label for="twitter" class="form-label">Twitter URL</label>
        <input id="twitter" name="twitter" class="form-input" value={profile.twitter} />
      </div>
    </div>

    <div>
      <label for="stats" class="form-label">Stats (JSON)</label>
      <textarea id="stats" name="stats" class="form-input font-mono text-xs" rows="6">{statsJson}</textarea>
    </div>

    {#if form?.error}
      <p class="text-sm text-accent-red">{form.error}</p>
    {/if}

    <button type="submit" class="btn-primary">Save Profile</button>
  </form>
</div>
