export interface Profile {
  name: string;
  title: string;
  roles: string[];
  bio: string;
  email: string;
  location: string;
  github: string;
  linkedin: string;
  twitter: string;
  stats: { label: string; value: string }[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  tech: string[];
  github?: string;
  demo?: string;
  featured: boolean;
}

export interface TechItem {
  name: string;
  color: string;
}

export interface TechCategory {
  name: string;
  items: TechItem[];
}

export interface BlogCategory {
  slug: string;
  name: string;
  description: string;
  icon: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  category: string;
  content: string;
}
