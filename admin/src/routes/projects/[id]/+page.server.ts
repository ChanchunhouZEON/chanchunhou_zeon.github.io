import { getProject, updateProject } from '$lib/server/data';
import { error, redirect, fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export function load({ params }: { params: { id: string } }) {
  const project = getProject(params.id);
  if (!project) throw error(404, 'Project not found');
  return { project };
}

export const actions: Actions = {
  default: async ({ request, params }) => {
    const form = await request.formData();
    const title = form.get('title') as string;
    if (!title) return fail(400, { error: 'Title is required' });

    const updated = {
      id: params.id,
      title,
      description: form.get('description') as string || '',
      tech: (form.get('tech') as string).split(',').map(t => t.trim()).filter(Boolean),
      github: (form.get('github') as string) || undefined,
      demo: (form.get('demo') as string) || undefined,
      featured: form.get('featured') === 'on'
    };

    updateProject(params.id, updated);
    redirect(303, '/projects');
  }
};
