import { getTechStack, saveTechStack } from '$lib/server/data';
import type { Actions } from './$types';

export function load() {
  return { techStack: getTechStack() };
}

export const actions: Actions = {
  save: async ({ request }) => {
    const form = await request.formData();
    const stackJson = form.get('stack') as string;
    try {
      const stack = JSON.parse(stackJson);
      saveTechStack(stack);
      return { success: true };
    } catch {
      return { error: 'Invalid JSON' };
    }
  }
};
