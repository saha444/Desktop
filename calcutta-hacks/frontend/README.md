# Paycheck Landing Page

A modern Next.js landing page for Paycheck - "Payments that stay fair when people don't."

## Project Structure

This project follows the **shadcn/ui convention** with:
- **Components**: `/components/ui` - All reusable UI components
- **Utils**: `/lib/utils.ts` - Utility functions (including `cn` for className merging)
- **Styles**: `/app/globals.css` - Global Tailwind CSS styles with CSS variables

## Why `/components/ui`?

The `/components/ui` directory is the **standard shadcn/ui location** because:

1. **shadcn CLI Convention**: The `npx shadcn-ui@latest add [component]` command expects components in this location
2. **Path Aliases**: The `@/components/ui` alias is configured in `tsconfig.json` and `components.json`
3. **Organization**: Keeps reusable UI components separate from page-specific components
4. **Best Practice**: Follows the established pattern in the React/Next.js ecosystem
5. **Tooling Compatibility**: Works seamlessly with shadcn/ui CLI and other React component libraries

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- `three` - WebGL library for shader effects
- `@radix-ui/react-slot` - Radix UI primitives
- `class-variance-authority` - Component variant management
- `clsx` & `tailwind-merge` - Utility functions for className merging
- `lucide-react` - Icon library
- `tailwindcss-animate` - Animation utilities

### 2. Run Development Server

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## Components

### WebGLShader (`/components/ui/web-gl-shader.tsx`)

A WebGL shader component that creates an animated background effect using Three.js. It renders a full-screen canvas with a custom fragment shader.

**Usage:**
```tsx
import { WebGLShader } from "@/components/ui/web-gl-shader"

<WebGLShader />
```

### LiquidButton (`/components/ui/liquid-glass-button.tsx`)

A glassmorphic button component with liquid glass effects. Includes:
- `LiquidButton` - The main glass button component
- `MetalButton` - A metallic button variant
- `Button` - Standard button component

**Usage:**
```tsx
import { LiquidButton } from "@/components/ui/liquid-glass-button"

<LiquidButton size="xl" className="text-white border rounded-full">
  Connect Wallet
</LiquidButton>
```

## Landing Page Sections

1. **Hero Section**
   - Headline: "Payments that stay fair when people don't."
   - Two CTAs: "Connect Wallet" and "Create Escrow"
   - WebGLShader animated background

2. **How It Works** (Visual Timeline)
   - Define Scope → Lock Funds → Submit Work → Approve or Dispute → Economic Resolution
   - Interactive timeline with icons and descriptions

3. **Who It's For**
   - Freelancers
   - Clients
   - Public participants (Truth Supporters)

## Project Configuration

- **TypeScript**: Configured with strict mode and path aliases (`@/*`)
- **Tailwind CSS**: Configured with CSS variables for theming
- **shadcn/ui**: Configured via `components.json`
- **Next.js**: App Router with TypeScript

## Adding More shadcn/ui Components

To add more shadcn/ui components:

```bash
npx shadcn-ui@latest add [component-name]
```

Components will automatically be added to `/components/ui` as configured in `components.json`.

## File Structure

```
calcutta-hacks/
├── app/
│   ├── globals.css          # Tailwind CSS with CSS variables
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page (landing page)
├── components/
│   ├── ui/
│   │   ├── web-gl-shader.tsx        # WebGL shader component
│   │   └── liquid-glass-button.tsx  # Liquid glass button component
│   └── landing-page.tsx     # Landing page component
├── lib/
│   └── utils.ts             # Utility functions (cn helper)
├── components.json          # shadcn/ui configuration
├── tailwind.config.ts       # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies
```

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Run dev server: `npm run dev`
3. ✅ View landing page at `http://localhost:3000`
4. Customize components as needed
5. Add more shadcn/ui components using: `npx shadcn-ui@latest add [component-name]`

