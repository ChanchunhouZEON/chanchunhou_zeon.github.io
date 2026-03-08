export interface Project {
	title: string;
	description: string;
	tech: string[];
	github?: string;
	demo?: string;
	featured: boolean;
}

export const projects: Project[] = [
	{
		title: 'Cloud Dashboard',
		description:
			'A real-time cloud infrastructure monitoring dashboard with interactive visualizations, alert management, and multi-provider support.',
		tech: ['React', 'TypeScript', 'Go', 'WebSocket', 'D3.js'],
		github: 'https://github.com/chanchunhou/cloud-dashboard',
		demo: 'https://dashboard.example.com',
		featured: true
	},
	{
		title: 'DevFlow CLI',
		description:
			'An intelligent CLI tool that streamlines development workflows with automated code review, smart commit messages, and CI/CD pipeline management.',
		tech: ['Rust', 'Git', 'GitHub API'],
		github: 'https://github.com/chanchunhou/devflow-cli',
		featured: true
	},
	{
		title: 'MarkdownX',
		description:
			'A next-generation Markdown editor with real-time collaboration, AI-powered suggestions, and extensible plugin system.',
		tech: ['Svelte', 'TypeScript', 'CRDT', 'WebRTC'],
		github: 'https://github.com/chanchunhou/markdownx',
		demo: 'https://markdownx.example.com',
		featured: true
	},
	{
		title: 'API Gateway',
		description:
			'High-performance API gateway with rate limiting, authentication, request transformation, and comprehensive analytics.',
		tech: ['Go', 'Redis', 'PostgreSQL', 'Docker'],
		github: 'https://github.com/chanchunhou/api-gateway',
		featured: false
	},
	{
		title: 'Design System',
		description:
			'A comprehensive, accessible component library with dark mode support, theming engine, and Figma integration.',
		tech: ['Svelte', 'TailwindCSS', 'Storybook'],
		github: 'https://github.com/chanchunhou/design-system',
		demo: 'https://ds.example.com',
		featured: false
	},
	{
		title: 'Log Analyzer',
		description:
			'Distributed log aggregation and analysis platform with full-text search, anomaly detection, and customizable dashboards.',
		tech: ['Python', 'Elasticsearch', 'Kafka', 'React'],
		github: 'https://github.com/chanchunhou/log-analyzer',
		featured: false
	}
];
