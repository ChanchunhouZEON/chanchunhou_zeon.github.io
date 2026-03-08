import { getProjects, deleteProject } from '$lib/server/data';
import type { Actions } from './$types';

export function load() {
  return { projects: getProjects() };
}

export const actions: Actions = {
  delete: async ({ request }) => {
    const form = await request.formData();
    const id = form.get('id') as string;
    deleteProject(id);
    return { success: true };
  }
};
