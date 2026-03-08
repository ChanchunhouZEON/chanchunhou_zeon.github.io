import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';
import type { Node, Parent } from 'unist';

interface BlockquoteNode extends Parent {
	type: 'blockquote';
	data?: {
		hName?: string;
		hProperties?: Record<string, string>;
	};
}

interface ParagraphNode extends Parent {
	type: 'paragraph';
	data?: {
		hName?: string;
		hProperties?: Record<string, string>;
	};
}

interface TextNode extends Node {
	type: 'text';
	value: string;
}

interface HtmlNode extends Node {
	type: 'html';
	value: string;
}

// Lucide SVG icons matching Obsidian's callout icons
const CALLOUT_ICONS: Record<string, string> = {
	note: '<svg class="callout-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.855z"/></svg>',
	tip: '<svg class="callout-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
	info: '<svg class="callout-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
	warning: '<svg class="callout-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
	danger: '<svg class="callout-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>',
	bug: '<svg class="callout-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/><path d="M22 13h-4"/><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/></svg>',
	example: '<svg class="callout-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>',
	quote: '<svg class="callout-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/></svg>',
	success: '<svg class="callout-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
	question: '<svg class="callout-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>',
	abstract: '<svg class="callout-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>',
	todo: '<svg class="callout-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>',
	important: '<svg class="callout-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
	caution: '<svg class="callout-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>'
};

const CALLOUT_LABELS: Record<string, string> = {
	note: 'Note',
	tip: 'Tip',
	info: 'Info',
	warning: 'Warning',
	danger: 'Danger',
	bug: 'Bug',
	example: 'Example',
	quote: 'Quote',
	success: 'Success',
	question: 'Question',
	abstract: 'Abstract',
	todo: 'Todo',
	important: 'Important',
	caution: 'Caution'
};

function remarkCallouts() {
	return (tree: Node) => {
		visit(tree, 'blockquote', (node: BlockquoteNode) => {
			const firstChild = node.children[0] as ParagraphNode | undefined;
			if (!firstChild || firstChild.type !== 'paragraph') return;

			const firstInline = firstChild.children[0] as TextNode | undefined;
			if (!firstInline || firstInline.type !== 'text') return;

			// Use [ \t]* instead of \s* to avoid matching newlines
			const match = firstInline.value.match(/^\[!(\w+)\][ \t]*(.*)/);
			if (!match) return;

			const typeName = match[1].toLowerCase();
			const customTitle = match[2]?.trim();
			if (!CALLOUT_LABELS[typeName]) return;

			const title = customTitle || CALLOUT_LABELS[typeName];
			const icon = CALLOUT_ICONS[typeName];

			// Remove only the first line (callout marker line) from the text
			const newlineIdx = firstInline.value.indexOf('\n');
			if (newlineIdx !== -1) {
				firstInline.value = firstInline.value.slice(newlineIdx + 1);
			} else {
				if (firstChild.children.length === 1) {
					node.children.shift();
				} else {
					firstChild.children.shift();
				}
			}

			// Convert the blockquote to a callout div
			node.data = node.data || {};
			node.data.hName = 'div';
			node.data.hProperties = { class: `callout callout-${typeName}` };

			// Wrap remaining content in a callout-content div using raw HTML markers
			const contentChildren = [...node.children];
			node.children = [];

			// Title with SVG icon (as raw HTML)
			const titleHtml: HtmlNode = {
				type: 'html',
				value: `<div class="callout-title">${icon}<span>${title}</span></div>`
			};

			// Content wrapper
			const contentOpenHtml: HtmlNode = { type: 'html', value: '<div class="callout-content">' };
			const contentCloseHtml: HtmlNode = { type: 'html', value: '</div>' };

			node.children.push(titleHtml, contentOpenHtml, ...contentChildren, contentCloseHtml);
		});
	};
}

const processor = unified()
	.use(remarkParse)
	.use(remarkGfm)
	.use(remarkCallouts)
	.use(remarkRehype, { allowDangerousHtml: true })
	.use(rehypeRaw)
	.use(rehypeStringify);

export async function renderMarkdown(content: string): Promise<string> {
	const result = await processor.process(content);
	return String(result);
}

export function calculateReadingTime(content: string): string {
	const words = content.replace(/```[\s\S]*?```/g, '').split(/\s+/).filter(Boolean).length;
	const minutes = Math.max(1, Math.ceil(words / 200));
	return `${minutes} min`;
}
