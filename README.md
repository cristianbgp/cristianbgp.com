# cristianbgp.com

Personal website for [Cristian Granda](https://cristianbgp.com), built with Astro. It brings together a landing page, articles, a résumé, and a directory of small web tools.

## Stack

- [Astro 5](https://astro.build) for static pages and content collections
- [React 19](https://react.dev) for interactive islands
- [Tailwind CSS 4](https://tailwindcss.com) for styling
- [MDX](https://mdxjs.com) for articles
- [Radix UI](https://www.radix-ui.com) primitives and shadcn-style components
- [Bun](https://bun.sh) for dependency management and scripts

## Routes

| Route | Description |
| --- | --- |
| `/` | Landing page and social links |
| `/articles` | Article index |
| `/articles/[slug]` | Statically generated article pages |
| `/tools` | Directory of internal and external tools |
| `/tools/json-tree-viewer` | Interactive JSON editor and tree viewer |
| `/tools/pixel-art-poster` | Pixel-art poster composer and PNG exporter |
| `/resume` | Résumé generated from structured JSON |
| `/rss.xml` | Article RSS feed |

The site also provides a command palette on every page. Press <kbd>⌘</kbd> + <kbd>K</kbd> on macOS or <kbd>Ctrl</kbd> + <kbd>K</kbd> elsewhere to open it. The theme shortcut is <kbd>⌘/Ctrl</kbd> + <kbd>I</kbd>.

## Getting started

Install dependencies:

```sh
bun install
```

Start the development server:

```sh
bun dev
```

The site will be available at [http://localhost:4321](http://localhost:4321).

## Commands

| Command | Description |
| --- | --- |
| `bun dev` | Start the local development server |
| `bun run build` | Build the production site into `dist/` |
| `bun run preview` | Preview the production build locally |
| `bun run astro check` | Validate Astro, TypeScript, and content files |

## Project structure

```text
.
├── public/                  # Static public assets
├── src/
│   ├── assets/              # Images processed by Astro
│   ├── components/          # Astro and React components
│   │   ├── animate-ui/      # Animated interface primitives
│   │   └── ui/              # Shared UI components
│   ├── content/
│   │   ├── articles/        # Markdown and MDX articles
│   │   └── tools/           # Tool directory entries
│   ├── hooks/               # React hooks
│   ├── layouts/             # Shared page and article layouts
│   ├── lib/                 # Utilities and résumé data
│   ├── pages/               # File-based routes
│   ├── stores/              # Shared Nanostores state
│   ├── styles/              # Global styles and theme tokens
│   └── content.config.ts    # Content collection schemas
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

Astro renders the site statically. React is hydrated only where browser-side behavior is needed, such as the command palette, animated text, JSON viewer, and poster builder.

## Content

### Adding an article

Create a `.md` or `.mdx` file in `src/content/articles/` with frontmatter matching the `articles` schema in `src/content.config.ts`:

```md
---
title: "Article title"
description: "Short summary"
date: "2026-01-01T00:00:00.000Z"
published: true
tags: ["astro", "web"]
lang: "en"
archived: false
---
```

The filename becomes the article slug. For example, `my-article.mdx` is published at `/articles/my-article/`.

Optional article fields are `description`, `updatedDate`, `heroImage`, and `archived`.

### Adding a tool

Create a Markdown file in `src/content/tools/` with the following metadata:

```md
---
id: "tool-name"
title: "Tool name"
description: "What the tool does"
url: "/tools/tool-name"
date: "2026-01-01"
---
```

The URL may point to a route in this project or to an external website. Internal interactive tools also need a page in `src/pages/tools/` and their React component in `src/components/`.

## Résumé

Résumé content is stored in `src/lib/resume.json` and rendered by `src/components/ResumeViewer.astro`. Update the JSON data to change work experience, skills, education, languages, or profile links.

## Deployment

The project produces a static build in `dist/` and is configured with `https://cristianbgp.com` as its canonical site URL. Any static hosting provider that serves the generated directory can host it.
