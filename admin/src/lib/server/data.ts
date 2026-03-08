import { readFileSync, writeFileSync, readdirSync, unlinkSync, existsSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';
import matter from 'gray-matter';
import type { Profile, Project, TechCategory, BlogCategory, BlogPost } from '$lib/types';

const DATA_DIR = resolve(process.cwd(), '..', 'data');
const BLOG_DIR = join(DATA_DIR, 'blog');

function readJSON<T>(filename: string): T {
  const content = readFileSync(join(DATA_DIR, filename), 'utf-8');
  return JSON.parse(content);
}

function writeJSON<T>(filename: string, data: T): void {
  const filePath = join(DATA_DIR, filename);
  writeFileSync(filePath, JSON.stringify(data, null, '\t') + '\n');
}

// Profile
export function getProfile(): Profile {
  return readJSON<Profile>('profile.json');
}

export function saveProfile(profile: Profile): void {
  writeJSON('profile.json', profile);
}

// Projects
export function getProjects(): Project[] {
  return readJSON<Project[]>('projects.json');
}

export function getProject(id: string): Project | undefined {
  return getProjects().find(p => p.id === id);
}

export function saveProjects(projects: Project[]): void {
  writeJSON('projects.json', projects);
}

export function addProject(project: Project): void {
  const projects = getProjects();
  projects.push(project);
  saveProjects(projects);
}

export function updateProject(id: string, updated: Project): void {
  const projects = getProjects();
  const idx = projects.findIndex(p => p.id === id);
  if (idx !== -1) {
    projects[idx] = updated;
    saveProjects(projects);
  }
}

export function deleteProject(id: string): void {
  const projects = getProjects().filter(p => p.id !== id);
  saveProjects(projects);
}

// Tech Stack
export function getTechStack(): TechCategory[] {
  return readJSON<TechCategory[]>('techStack.json');
}

export function saveTechStack(stack: TechCategory[]): void {
  writeJSON('techStack.json', stack);
}

// Blog Categories
export function getBlogCategories(): BlogCategory[] {
  return readJSON<BlogCategory[]>('blogCategories.json');
}

export function saveBlogCategories(categories: BlogCategory[]): void {
  writeJSON('blogCategories.json', categories);
}

export function addBlogCategory(category: BlogCategory): void {
  const cats = getBlogCategories();
  cats.push(category);
  saveBlogCategories(cats);
}

export function updateBlogCategory(slug: string, updated: BlogCategory): void {
  const cats = getBlogCategories();
  const idx = cats.findIndex(c => c.slug === slug);
  if (idx !== -1) {
    cats[idx] = updated;
    saveBlogCategories(cats);
  }
}

export function deleteBlogCategory(slug: string): void {
  const cats = getBlogCategories().filter(c => c.slug !== slug);
  saveBlogCategories(cats);
}

// Blog Posts
export function listPosts(): Omit<BlogPost, 'content'>[] {
  if (!existsSync(BLOG_DIR)) return [];
  const files = readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'));
  return files.map(file => {
    const raw = readFileSync(join(BLOG_DIR, file), 'utf-8');
    const { data } = matter(raw);
    return {
      slug: file.replace('.md', ''),
      title: data.title ?? '',
      date: data.date ?? '',
      excerpt: data.excerpt ?? '',
      tags: data.tags ?? [],
      category: data.category ?? ''
    };
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPost(slug: string): BlogPost | null {
  const filePath = join(BLOG_DIR, `${slug}.md`);
  if (!existsSync(filePath)) return null;
  const raw = readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  return {
    slug,
    title: data.title ?? '',
    date: data.date ?? '',
    excerpt: data.excerpt ?? '',
    tags: data.tags ?? [],
    category: data.category ?? '',
    content
  };
}

export function savePost(slug: string, meta: Omit<BlogPost, 'slug' | 'content'>, content: string): void {
  if (!existsSync(BLOG_DIR)) mkdirSync(BLOG_DIR, { recursive: true });
  const frontmatter = {
    title: meta.title,
    date: meta.date,
    excerpt: meta.excerpt,
    tags: meta.tags,
    category: meta.category
  };
  const fileContent = matter.stringify(content, frontmatter);
  writeFileSync(join(BLOG_DIR, `${slug}.md`), fileContent);
}

export function deletePost(slug: string): void {
  const filePath = join(BLOG_DIR, `${slug}.md`);
  if (existsSync(filePath)) unlinkSync(filePath);
}
