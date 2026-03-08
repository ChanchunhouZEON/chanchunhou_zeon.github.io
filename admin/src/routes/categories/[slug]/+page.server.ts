import { getBlogCategories, updateBlogCategory } from '$lib/server/data';
import { error, redirect, fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export function load({ params }: { params: { slug: string } }) {
  const cats = getBlogCategories();
  const category = cats.find(c => c.slug === params.slug);
  if (!category) throw error(404, 'Category not found');
  return { category };
}

export const actions: Actions = {
  default: async ({ request, params }) => {
    const form = await request.formData();
    const name = form.get('name') as string;
    if (!name) return fail(400, { error: 'Name is required' });

    updateBlogCategory(params.slug, {
      slug: params.slug,
      name,
      description: form.get('description') as string || '',
      icon: form.get('icon') as string || ''
    });
    redirect(303, '/categories');
  }
};
