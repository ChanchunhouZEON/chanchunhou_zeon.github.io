import categoriesData from '../../../data/blogCategories.json';

export interface BlogCategory {
	slug: string;
	name: string;
	description: string;
	icon: string;
}

export const blogCategories: BlogCategory[] = categoriesData as BlogCategory[];
