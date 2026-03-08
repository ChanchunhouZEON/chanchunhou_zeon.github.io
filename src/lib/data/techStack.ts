export interface Tech {
	name: string;
	color: string;
}

export interface TechCategory {
	name: string;
	items: Tech[];
}

export const techStack: TechCategory[] = [
	{
		name: 'Frontend',
		items: [
			{ name: 'Svelte', color: '#ff3e00' },
			{ name: 'React', color: '#61dafb' },
			{ name: 'Vue.js', color: '#42b883' },
			{ name: 'TypeScript', color: '#3178c6' },
			{ name: 'TailwindCSS', color: '#06b6d4' },
			{ name: 'Next.js', color: '#808080' }
		]
	},
	{
		name: 'Backend',
		items: [
			{ name: 'Node.js', color: '#68a063' },
			{ name: 'Python', color: '#3776ab' },
			{ name: 'Go', color: '#00add8' },
			{ name: 'Rust', color: '#ce422b' },
			{ name: 'PostgreSQL', color: '#4169e1' },
			{ name: 'Redis', color: '#dc382d' }
		]
	},
	{
		name: 'DevOps & Cloud',
		items: [
			{ name: 'Docker', color: '#2496ed' },
			{ name: 'Kubernetes', color: '#326ce5' },
			{ name: 'AWS', color: '#ff9900' },
			{ name: 'GitHub Actions', color: '#2088ff' },
			{ name: 'Terraform', color: '#844fba' },
			{ name: 'Linux', color: '#fcc624' }
		]
	},
	{
		name: 'Tools & Others',
		items: [
			{ name: 'Git', color: '#f05032' },
			{ name: 'Figma', color: '#a259ff' },
			{ name: 'Neovim', color: '#57a143' },
			{ name: 'GraphQL', color: '#e10098' },
			{ name: 'WebSocket', color: '#808080' },
			{ name: 'Vite', color: '#646cff' }
		]
	}
];
