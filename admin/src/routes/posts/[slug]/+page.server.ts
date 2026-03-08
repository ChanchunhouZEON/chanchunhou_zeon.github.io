import { getPost, savePost, getBlogCategories } from '$lib/server/data';
import { error, redirect, fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export function load({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  if (!post) throw error(404, 'Post not found');
  return { post, categories: getBlogCategories() };
}

export const actions: Actions = {
  default: async ({ request, params }) => {
    const form = await request.formData();
    const title = form.get('title') as string;
    if (!title) return fail(400, { error: 'Title is required' });

    const meta = {
      title,
      date: form.get('date') as string || '',
      excerpt: form.get('excerpt') as string || '',
      tags: (form.get('tags') as string || '').split(',').map(t => t.trim()).filter(Boolean),
      category: form.get('category') as string || ''
    };
    const content = form.get('content') as string || '';

    savePost(params.slug, meta, content);
    redirect(303, '/posts');
  }
};
