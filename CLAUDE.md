# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Architecture

This is a Next.js 16 app-router project with React 19 and Tailwind CSS.

### Structure

- `src/app/` - Next.js app router pages and layouts
- `src/app/api/chat/route.js` - Chat API endpoint using Vercel AI SDK
- `src/app/page.js` - Main chat interface (client component)
- `src/app/layout.js` - Root layout with Geist font configuration
- `public/` - Static assets

### AI Integration

The app uses the Vercel AI SDK (`ai` package) with OpenAI:
- when using ai-sdk, please use the v6 version
- API route at `/api/chat` handles POST requests with `{ text }` or `{ messages }` body
- Uses `streamText` from AI SDK with `gpt-4o-mini` model
- Returns SSE-style streaming responses via `toUIMessageStreamResponse()`
- Client parses `data: {...}` chunks to extract text from various response formats

### Environment Variables

Requires `OPENAI_API_KEY` to be set for the chat API to function.

## Conventions

- Use Next.js app router conventions for new routes (folder-based routing under `src/app/`)
- Mark client-side interactive components with `'use client'` directive
- Use Tailwind utility classes for styling; theme variables are in `src/app/globals.css`
- Fonts are loaded via `next/font` in the root layout
