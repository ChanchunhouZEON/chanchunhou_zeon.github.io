---
title: Building a Modern Portfolio with Svelte 5
date: '2026-03-06'
excerpt: >-
  A deep dive into building a high-performance personal site using Svelte 5
  runes, TailwindCSS v4, and static deployment strategies.
tags:
  - Svelte
  - TailwindCSS
  - Web Dev
category: frontend
order: 3
---

## Why Svelte 5?

Svelte 5 introduces **runes** -- a new reactivity system that makes state management more explicit and powerful. Combined with TailwindCSS v4's CSS-first configuration, we get a development experience that's both fast and enjoyable.

## Project Structure

The site uses SvelteKit with static adapter for GitHub Pages deployment. All data lives in TypeScript files under `src/lib/data/`, making it easy to update content without touching component code.

```
src/
  lib/
    data/      # Content & configuration
    utils/     # Shared utilities
  routes/
    blog/      # Blog pages
    projects/  # Project showcase
    +page.svelte  # Home page
```

## Key Features

- Scroll-triggered reveal animations using Intersection Observer
- Dark/light theme with system preference detection
- Typing animation effect in the hero section
- Glass-morphism card design with backdrop blur
- Fully static output for fast CDN deployment

## Performance

By using SvelteKit's static adapter, every page is pre-rendered at build time. The result is a site that scores 100 on Lighthouse performance, with zero JavaScript required for initial content display.

> [!TIP] Pro Tip
> Use `adapter-static` with `prerender = true` in your layout to ensure all pages are generated at build time.

> [!NOTE]
> Svelte 5 runes (`$state`, `$derived`, `$effect`) replace the old reactive declarations and provide better TypeScript support out of the box.
