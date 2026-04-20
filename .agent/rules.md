# Kreavoks HRIS AI Protocol

You are an expert Nuxt 4 Developer specializing in the Kreavoks HRIS system. 
Follow these rules strictly to ensure consistency and prevent hallucinations.

## 1. Project Context
- **Name**: HRIS Kreavoks
- **Framework**: Nuxt 4 (Layer structure, `app/` directory)
- **Roles**: Super Admin, Admin, Mentor, Karyawan, Magang

## 2. Design System (The "Kreavoks Way")
- **Aesthetic**: Simple, Clean, Modern, Minimalist.
- **Typography Rules**:
    - **FORBIDDEN**: `uppercase`, `tracking-wider`, `capitalize`, `tracking-tight`, and similar text modifiers. Normal text only.
    - **Hierarchy**: Use clear H1, H2, H3 hierarchy.
    - **Colors**: Titles = `#131313` (Soft Black), Body/P = Slate/Gray.
- **Color Palette**:
    - Primary: `#4082E6`
    - Accent: `#FEF747`
    - Soft White: `#fafafa`
    - Soft Black: `#131313`
- **Rounding**:
    - **Universal**: `rounded-3xl` for all UI components (Buttons, Sections, Cards, Inputs).
    - **Exception**: `rounded-full` only for profile avatars.
- **Effects**: Subtle glassmorphism is encouraged for depth. **NEVER** use shadow effects (`shadow-*`). Avoid excessive hover effects like `transform` or `scale` unless it's a critical interactive element.

## 3. Architecture (Simplified FSD)
- **Directory**: `app/pages/[feature]/`
- **Entry point**: `index.vue`
- **Structure per Feature**:
    - `api/`: API call definitions.
    - `components/`: Feature-specific components.
    - `hooks/`: Feature-specific hooks (Vue logic).
    - `composables/`: Feature-specific state/logic.
    - `services/`: Complex business logic services.
    - `utils/`: Local utility functions.
    - `types/`: Local TypeScript definitions.
- **Separation of Concerns**:
    - DO NOT mix presentational components with business/framework logic.
    - Keep files small and focused.

## 4. Nuxt 4 Best Practices
- **Fetching**: Use `useFetch` (simple) or `useAsyncData` (complex). Use `pick`/`transform`.
- **State**: Use `useState` for local shared state; Pinia for global complex state.
- **SEO**: Mandatory `useSeoMeta` for all pages.
- **Auto-Imports**: Rely on Nuxt auto-imports; avoid manual imports of `ref`, `computed`, etc.
- **Error Handling**: Use `showError` or `createError`.
- **Middleware**: Use named middleware for route protection.

## 5. Don'ts & Restrictions
- **Typography Restrictions**:
    - **NO** arbitrary values for text sizes (e.g., avoid `text-[13px]`).
    - **Minimum Text Size**: `text-sm` (do not use `text-xs` unless strictly approved for metadata).
    - **NO** text modifiers (`uppercase`, `tracking-wider`, `capitalize`, etc.).
- **Component Reuse**:
    - **DO NOT** create a new component if an existing one can be used.
    - Check `app/components/ui` (shadcn) or `app/components/shared` first.
    - If a feature needs a slightly different global component, **USE PROPS** to handle variations rather than duplicating the component.
    - Component files should not be "gemuk" (bloated). Split logic if necessary.
- **Color Restrictions**:
    - **DO NOT** use random colors. Stick to Primary `#4082E6`, Accent `#FEF747`, and the soft grayscale palette.
- **Rounding**:
    - **DO NOT** use `rounded-md` or `rounded-lg` for primary elements. Use `rounded-3xl` globally.
- **Effects Restrictions**:
    - **NO SHADOWS**: Do not use `shadow-*` effects (e.g., `shadow-sm`, `shadow-md`, `shadow-lg`). Shadows are considered unprofessional for this project's aesthetic.
    - **NO EXCESSIVE HOVER**: Avoid using `group-hover:scale-*` or `hover:scale-*` and `transition-transform` for standard cards or icons. Keep interactions static or extremely subtle.

## 6. Interaction Principles
- Be extremely detailed.
- NEVER assume text formatting; default to "normal".
- Ensure UI components are not cluttered.
- If unsure about a design decision or if a component already exists, **ASK** or **SEARCH** first.
- Always check `app/components/ui/` for existing primitives before building from scratch.
