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
- **Styling Restrictions**:
    - **NO HARDCODED CLASSES**: Do not hardcode styling classes (e.g., `bg-white`, `border-slate-100`, `text-slate-600`) directly on instances of shared UI components inside pages.
    - **Use Semantic/Variant Props**: If a component needs styling changes, define it via `variant`, `size`, or other props in the parent component definition (e.g. `app/components/ui/button/Button.vue`). This ensures consistency across all pages that use the component.
    - **Semantic Colors Only**: Always use Tailwind semantic variables (e.g., `bg-background`, `bg-card`, `border-border`, `text-foreground`, `text-muted-foreground`) to ensure proper dark mode support out-of-the-box, rather than hardcoding light/dark colors individually.
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

## 7. Class Management (`cn` utility)
- **Group and Comment Styles**: When using the `cn()` utility for complex classes, separate and group related states/styles together and add inline comments explaining what each group does. This significantly improves readability and maintainability.
- **Example Usage**:
```vue
  <CalendarCellTrigger
    :class="cn(
      buttonVariants({ variant: 'ghost' }),
      'h-8 w-8 p-0 font-normal',
      '[&[data-today]:not([data-selected])]:bg-accent [&[data-today]:not([data-selected])]:text-accent-foreground',
      // Selected
      'data-[selected]:bg-kv-primary data-[selected]:text-white data-[selected]:opacity-100 data-[selected]:hover:bg-kv-primary data-[selected]:hover:text-white data-[selected]:focus:bg-kv-primary data-[selected]:focus:text-white',
      // Disabled
      'data-[disabled]:text-muted-foreground data-[disabled]:opacity-50',
      // Unavailable
      'data-[unavailable]:text-destructive-foreground data-[unavailable]:line-through',
      // Outside months
      'data-[outside-view]:text-muted-foreground data-[outside-view]:opacity-50 [&[data-outside-view][data-selected]]:bg-accent/50 [&[data-outside-view][data-selected]]:text-muted-foreground [&[data-outside-view][data-selected]]:opacity-30',
      props.class,
    )"
    v-bind="forwardedProps"
  >
```
