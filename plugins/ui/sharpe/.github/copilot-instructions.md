# Copilot Instructions

## Project context

- This is a Next.js 16.1.6 application using the App Router architecture
- TypeScript is used throughout the project
- The project is located under `/Users/johnnym/Code/fire-systems/plugins/ui/sharpe`
- Components are located in `app/components/` directory
- UI primitives from shadcn/ui are located in `@/components/ui/` (via alias)
- Utility functions are in `lib/utils.ts`
- Avoid editing build outputs, dependencies, and generated files (`node_modules/`, `.next/`, `dist/`)

## Tech stack

- **Framework**: Next.js 16.1.6 with App Router
- **React**: 19.2.3 (with React Compiler enabled via babel-plugin-react-compiler)
- **TypeScript**: Strict type checking enabled
- **Styling**: Tailwind CSS v4 with inline theme configuration (in `app/globals.css`)
- **Component Library**: shadcn/ui (New York style, with RSC support)
- **UI Primitives**: Radix UI (via shadcn/ui)
- **Icons**: Lucide React
- **Utilities**: `clsx`, `tailwind-merge` (via `cn()` helper), `class-variance-authority`

## Coding conventions
- Use Next.js provided layouts, nested layouts, and dynamic segments.

### Component structure
- Use `'use client'` directive only when client-side interactivity is required (state, events, hooks)
- Server components are the default - avoid `'use client'` unless necessary
- Keep components small, focused, and single-purpose
- Place reusable components in `app/components/`
- Place shadcn/ui primitives in `components/ui/` (managed by shadcn CLI)
- Use descriptive, semantic component names (e.g., `TickerLayout`, `TickerList`, `TickerDetails`)

### Styling and layout
- **Primary layout approach**: Use Tailwind CSS utility classes with flex/grid layouts
- Prefer flex for responsive layouts (e.g., `flex flex-col lg:flex-row` for portrait→landscape)
- Use shadcn design tokens for consistency:
  - `bg-background`, `bg-card`, `bg-accent` for backgrounds
  - `text-foreground`, `text-muted-foreground` for text
  - `border-border` for borders
- Follow responsive design patterns:
  - Mobile-first: base styles for portrait/mobile
  - Use `sm:`, `md:`, `lg:`, `xl:` breakpoints for larger screens
  - Standard breakpoint for landscape: `lg:` (1024px+)
- Use `gap-*` utilities for spacing between flex/grid children
- Avoid custom CSS unless absolutely necessary - prefer Tailwind utilities

### TypeScript patterns
- Use proper type definitions for props and state
- Leverage type inference where appropriate
- Define interfaces for complex data structures
- Use `React.FC` sparingly - prefer explicit function declarations

### File organization
- Keep related components together
- Use index exports when exporting multiple items from a directory
- Follow Next.js App Router conventions:
  - `page.tsx` for route pages
  - `layout.tsx` for layouts
  - `loading.tsx`, `error.tsx` for special files
  - Group routes using folders with `page.tsx` inside

### Data handling
- Use placeholder/mock data in components during initial development
- Structure data types to match expected API responses
- Comment placeholders clearly: `// Placeholder data - will be replaced with real data later`
- Plan for state management and data fetching patterns (to be added later)

## Changes and safety

- Make minimal, targeted edits that match the existing code style
- Maintain consistency with established patterns in the codebase
- If a request is ambiguous, ask a short clarifying question
- Do not introduce new dependencies without explicit approval
- Verify responsive behavior when making layout changes

## shadcn/ui usage

- Use `npx shadcn@latest add <component>` to add new shadcn components
- Installed components go to `components/ui/` automatically
- Use the `cn()` utility from `lib/utils.ts` for conditional classes
- Customize components by editing files in `components/ui/` (they're yours to modify)
- Follow shadcn conventions:
  - Use component variants via `class-variance-authority`
  - Compose primitives from Radix UI
  - Style with Tailwind utilities

## Architecture patterns

### Current implementation
- **Two-column responsive layout**: TickerList (left/top) and TickerDetails (right/bottom)
- **Responsive strategy**: Vertical stacking on mobile (`flex-col`), side-by-side on desktop (`lg:flex-row`)
- **Component composition**: Container components orchestrate layout, child components handle content
- **Separation of concerns**: Layout logic separate from business logic

### Future expansion
- Components are structured to support:
  - State management integration (React Context, Zustand, etc.)
  - Real-time data updates
  - Interactive ticker selection
  - Additional layouts and visualizations
  - Server-side data fetching via React Server Components

## Development workflow

- **Dev server**: `npm run dev` (runs on port 3000 with webpack)
- **Build**: `npm run build`
- **Type checking**: `npx tsc --noEmit`
- **Linting**: `npm run lint`

## Testing and validation

- Verify responsive layouts at different breakpoints (mobile, tablet, desktop)
- Check TypeScript compilation with `npx tsc --noEmit` after making changes
- Test both light and dark mode variants (theme is configured in `globals.css`)
- Ensure accessibility with semantic HTML and ARIA attributes where needed

## Notes

- React Compiler is enabled - avoid manual memoization unless profiling shows it's needed
- Tailwind CSS v4 uses inline theme configuration via `@theme inline` in globals.css
- Path aliases are configured: `@/components`, `@/lib`, `@/utils`, `@/hooks`
- The project uses the New York style variant of shadcn/ui components
- CSS variables for theming support automatic dark mode via `prefers-color-scheme`
