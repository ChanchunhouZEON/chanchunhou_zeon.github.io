import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';
import type { Node, Parent } from 'unist';
import calloutsData from '../../data/callouts.json';

interface CalloutDef {
	type: string;
	label: string;
	color: string;
	icon: string;
}

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

// Build lookup maps from JSON config
const callouts = calloutsData as CalloutDef[];
const CALLOUT_MAP = new Map<string, CalloutDef>();
for (const c of callouts) {
	CALLOUT_MAP.set(c.type, c);
}

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
			const callout = CALLOUT_MAP.get(typeName);
			if (!callout) return;

			const title = customTitle || callout.label;
			const icon = `<svg class="callout-icon" ${callout.icon.replace(/^<svg\s*/, '')}`;

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

			// Convert the blockquote to a callout div with inline color
			node.data = node.data || {};
			node.data.hName = 'div';
			node.data.hProperties = {
				class: 'callout',
				style: `--callout-color: ${callout.color}`
			};

			// Wrap remaining content in a callout-content div using raw HTML markers
			const contentChildren = [...node.children];
			node.children = [];

			const titleHtml: HtmlNode = {
				type: 'html',
				value: `<div class="callout-title">${icon}<span>${title}</span></div>`
			};

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
