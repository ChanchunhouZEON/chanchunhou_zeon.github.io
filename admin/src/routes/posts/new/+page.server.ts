import { savePost, getBlogCategories } from '$lib/server/data';
import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export function load() {
  return { categories: getBlogCategories() };
}

export const actions: Actions = {
  default: async ({ request }) => {
    const form = await request.formData();
    const title = form.get('title') as string;
    if (!title) return fail(400, { error: 'Title is required' });

    const slug = (form.get('slug') as string) || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const meta = {
      title,
      date: form.get('date') as string || new Date().toISOString().split('T')[0],
      excerpt: form.get('excerpt') as string || '',
      tags: (form.get('tags') as string || '').split(',').map(t => t.trim()).filter(Boolean),
      category: form.get('category') as string || ''
    };
    const content = form.get('content') as string || '';

    savePost(slug, meta, content);
    redirect(303, '/posts');
  }
};
