import
  {
    Box,
    Code,
    Database,
    Layout,
    Palette,
    Search,
    Server,
    ShieldCheck,
    Terminal,
    Type,
    Wind,
    Zap
  } from 'lucide-react'

// Simple SVG components for brand icons that are not in Lucide
// Using simple paths or Lucide alternatives where appropriate to avoid external assets

export const TechIcons: Record<string, React.ElementType> = {
  'React': Box, // Placeholder for React (Box usually represents components)
  'TypeScript': Code,
  'Vite': Zap,
  'Bun': Terminal, // Bun is a runtime
  'DaisyUI': Palette,
  'ShadCN': Layout,
  'TanStack': Database, // Tanstack Query/Table often deals with data
  'Elysia': Server,
  'Zustand': Box, // State management
  'Framer Motion': Wind, // Animation
  'Drizzle': Database,
  'Lucide Icons': Search, // Icon search
  'Zod': ShieldCheck, // Validation
  'Tailwind': Wind,
  'ESLint': Search // Code analysis
}

// Map specific colors for each tech if needed, or use a default style
export const TechColors: Record<string, string> = {
  'React': 'text-cyan-400',
  'TypeScript': 'text-blue-500',
  'Vite': 'text-yellow-400',
  'Bun': 'text-rose-200',
  'Tailwind': 'text-cyan-300',
  'Drizzle': 'text-lime-400',
  'Zod': 'text-indigo-400',
  'Framer Motion': 'text-purple-400',
}
