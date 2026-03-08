import { getProfile, saveProfile } from '$lib/server/data';
import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';

export function load() {
  return { profile: getProfile() };
}

export const actions: Actions = {
  default: async ({ request }) => {
    const form = await request.formData();
    const profile = {
      name: form.get('name') as string,
      title: form.get('title') as string,
      roles: (form.get('roles') as string).split(',').map(r => r.trim()).filter(Boolean),
      bio: form.get('bio') as string,
      email: form.get('email') as string,
      location: form.get('location') as string,
      github: form.get('github') as string,
      linkedin: form.get('linkedin') as string,
      twitter: form.get('twitter') as string,
      stats: JSON.parse(form.get('stats') as string || '[]')
    };

    if (!profile.name || !profile.title) return fail(400, { error: 'Name and title are required' });

    saveProfile(profile);
    return { success: true };
  }
};
