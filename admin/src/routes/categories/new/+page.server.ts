import { addBlogCategory } from '$lib/server/data';
import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request }) => {
    const form = await request.formData();
    const name = form.get('name') as string;
    if (!name) return fail(400, { error: 'Name is required' });

    const slug = (form.get('slug') as string) || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    addBlogCategory({
      slug,
      name,
      description: form.get('description') as string || '',
      icon: form.get('icon') as string || '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>'
    });
    redirect(303, '/categories');
  }
};
