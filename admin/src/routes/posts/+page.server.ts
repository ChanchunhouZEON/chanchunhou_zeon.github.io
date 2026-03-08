import { listPosts, deletePost } from '$lib/server/data';
import type { Actions } from './$types';

export function load() {
  return { posts: listPosts() };
}

export const actions: Actions = {
  delete: async ({ request }) => {
    const form = await request.formData();
    const slug = form.get('slug') as string;
    deletePost(slug);
    return { success: true };
  }
};
