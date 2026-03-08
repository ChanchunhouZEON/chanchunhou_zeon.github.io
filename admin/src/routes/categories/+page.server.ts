import { getBlogCategories, deleteBlogCategory } from '$lib/server/data';
import type { Actions } from './$types';

export function load() {
  return { categories: getBlogCategories() };
}

export const actions: Actions = {
  delete: async ({ request }) => {
    const form = await request.formData();
    const slug = form.get('slug') as string;
    deleteBlogCategory(slug);
    return { success: true };
  }
};
