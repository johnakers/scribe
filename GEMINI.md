# Project Reference: Scribe

**Deployment URL:** [https://scribe.club](https://scribe.club)

This document serves as a guide for development standards, tech stack usage, and architectural decisions for the Scribe project.

## Tech Stack

- **Framework:** React / Next.js (TypeScript)
- **Styling:** Tailwind CSS
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
- **Icons:** Lucide React
- **Deployment:** Vercel (Production: scribe.club)

## UI Component Strategy (shadcn/ui)

We use `shadcn/ui` for our component library. All components are located in `@/components/ui`. Shared or complex custom components should be placed in `@/components`.

### Customization

- **Theming:** Global styles and CSS variables are located in `src/app/globals.css`.
- **Tailwind:** Use the `cn()` utility (found in `lib/utils.ts`) for conditional class merging.

## Core Features

- **Relational Tables:** Supports linking entries between tables using `reference` column types.
- **Flexible IDs:** Multiple strategies for unique identifiers: Integer, UUID, and Epoch.
- **Data Persistence:** Uses `localStorage` for client-side persistence and supports JSON import/export.
- **JSON Engine:** Real-time syntax highlighting for project-wide JSON structure.

## Development Guidelines

### TypeScript

- Strict mode is enabled. Avoid using `any`.
- Define interfaces for props and API responses.

### Styling

- Prefer Tailwind CSS classes over CSS modules.
- Maintain dark mode compatibility using Tailwind's `dark:` variant and the `dark` class on `document.documentElement`.

### File Naming

- Components: PascalCase (e.g., `UserButton.tsx`)
- Hooks: camelCase starting with "use" (e.g., `useLocalStorage.ts`)
- Utilities: camelCase (e.g., `formatDate.ts`)

## Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npx shadcn-ui@latest add` - Add new UI components
