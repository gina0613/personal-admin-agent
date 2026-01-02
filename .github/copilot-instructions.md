# Copilot / AI agent instructions — personal-admin-agent

Purpose
- Help AI coding agents become immediately productive in this repository by summarizing architecture, workflows, conventions, and important files.

Big picture
- This is a small Next.js (app-router) site using the `app/` directory. The UI is a minimal starter created by `create-next-app` and lives under `src/app`.
- Build/runtime: Next.js 16 with React 19. The project uses Tailwind for styling and the Next `app` router pattern (see `src/app/layout.js` and `src/app/page.js`).

Key files and where to look
- `package.json`: scripts (`dev`, `build`, `start`, `lint`) and deps (notably `ai`, `next`, `react`).
- `src/app/layout.js`: global layout, font-loading via `next/font`. Use this when changing global UI behavior.
- `src/app/page.js`: the main page; the starting edit point for UI changes.
- `src/app/globals.css`: imports Tailwind and declares CSS variables (dark-mode via `prefers-color-scheme`).
- `public/`: static assets (SVGs used by `page.js`).

Developer workflows (explicit commands)
- Run development server: `npm run dev` (starts Next dev server on :3000).
- Build for production: `npm run build` then `npm run start`.
- Linting: `npm run lint` (uses `eslint` + `eslint-config-next`).

Conventions and patterns to follow
- App router / file locations: everything under `src/app/*` follows the Next `app` directory conventions — add routes by creating folders/files here.
- Styling: Tailwind is present; global styles and CSS variables are defined in `src/app/globals.css`. Prefer Tailwind utility classes for layout and quick changes; keep global variables for theme-level colors and fonts.
- Fonts: loaded in `src/app/layout.js` using Next's font helpers — preserve that pattern when adding fonts.
- Minimal single-page structure: `page.js` contains static markup and references `public/` assets; follow similar small-component extraction when expanding UI.

Integration points & external dependencies
- `ai` dependency appears in `package.json` but is not wired into the UI yet — if you add server-side AI calls, prefer Next server components or API routes and keep secrets in environment variables.
- No tests or CI config detected — assume local manual testing and Vercel deployment (standard for Next projects).

Notes for editing/PRs
- Keep edits small and focused; run `npm run dev` locally to validate visual and runtime changes.
- Preserve Next.js conventions (server vs client components). If adding client-side interactivity, mark the file with `'use client'` at the top.
- Respect existing CSS variables in `src/app/globals.css` for color and font tokens.

If something is unclear or you need examples (e.g., where to call the `ai` client or how to add an API route), ask and I will add short, concrete code snippets or a tiny example route.
