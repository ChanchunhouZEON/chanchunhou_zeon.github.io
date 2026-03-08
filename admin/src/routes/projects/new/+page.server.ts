import { addProject } from '$lib/server/data';
import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request }) => {
    const form = await request.formData();
    const title = form.get('title') as string;
    if (!title) return fail(400, { error: 'Title is required' });

    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const project = {
      id,
      title,
      description: form.get('description') as string || '',
      tech: (form.get('tech') as string).split(',').map(t => t.trim()).filter(Boolean),
      github: (form.get('github') as string) || undefined,
      demo: (form.get('demo') as string) || undefined,
      featured: form.get('featured') === 'on'
    };

    addProject(project);
    redirect(303, '/projects');
  }
};
