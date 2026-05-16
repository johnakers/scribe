# Project Reference: Scribe

This document serves as a guide for development standards, tech stack usage, and architectural decisions for the Scribe project.

## Tech Stack

- **Framework:** React / Next.js (TypeScript)
- **Styling:** Tailwind CSS
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
- **Icons:** Lucide React

## UI Component Strategy (shadcn/ui)

We use `shadcn/ui` for our component library. Unlike traditional component libraries, `shadcn/ui` components are added directly to the source code, allowing for full customization.

### Adding Components

To add a new component, use the CLI:

```bash
npx shadcn-ui@latest add [component-name]
```

_Example:_ `npx shadcn-ui@latest add button`

### Component Location

All shadcn components are located in `@/components/ui`. Shared or complex custom components should be placed in `@/components`.

### Customization

- **Theming:** Global styles and CSS variables are located in `src/app/globals.css`.
- **Tailwind:** Use the `cn()` utility (found in `lib/utils.ts`) for conditional class merging to ensure Tailwind classes are applied correctly.

## Development Guidelines

### TypeScript

- Strict mode is enabled. Avoid using `any`.
- Define interfaces for props and API responses.
- Leverage the `type` keyword for simple data structures and `interface` for object-oriented definitions.

### Styling

- Prefer Tailwind CSS classes over CSS modules or inline styles.
- Maintain accessibility (ARIA labels, keyboard navigation) by leveraging the Radix UI primitives baked into shadcn.

### File Naming

- Components: PascalCase (e.g., `UserButton.tsx`)
- Hooks: camelCase starting with "use" (e.g., `useLocalStorage.ts`)
- Utilities: camelCase (e.g., `formatDate.ts`)

## Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npx shadcn-ui@latest add` - Add new UI components
