import { getProfile, getProjects, getTechStack, getBlogCategories, listPosts } from '$lib/server/data';

export function load() {
  const profile = getProfile();
  const projects = getProjects();
  const techStack = getTechStack();
  const categories = getBlogCategories();
  const posts = listPosts();

  return {
    stats: {
      projects: projects.length,
      techItems: techStack.reduce((sum, cat) => sum + cat.items.length, 0),
      categories: categories.length,
      posts: posts.length
    },
    recentPosts: posts.slice(0, 5),
    profileName: profile.name
  };
}
