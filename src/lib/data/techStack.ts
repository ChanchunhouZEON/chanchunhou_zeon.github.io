import techStackData from '../../../data/techStack.json';

export interface Tech {
	name: string;
	color: string;
}

export interface TechCategory {
	name: string;
	items: Tech[];
}

export const techStack: TechCategory[] = techStackData as TechCategory[];
