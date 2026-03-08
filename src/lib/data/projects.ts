import projectsData from '../../../data/projects.json';

export interface Project {
	id: string;
	title: string;
	description: string;
	tech: string[];
	github?: string;
	demo?: string;
	featured: boolean;
}

export const projects: Project[] = projectsData as Project[];
