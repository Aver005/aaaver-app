# Changelog

## [Unreleased]

### Added
- [x] Initial analysis of project structure
- [x] Setup basic UI components with Glassmorphism (`GlassCard`, `Button`, `Reveal`)
- [x] Implement Hero section with animated background blobs
- [x] Implement Projects section with grid layout and hover effects
- [x] Implement Tech Stack section
- [x] Implement FAQ section with accordion
- [x] Implement Footer with contact form and social links
- [x] Add scroll animations using `IntersectionObserver`
- [x] Utility functions for class merging (`cn`)
- [x] Data separation in `src/data/portfolio.ts`
- [x] **Enriched UI (Visual Polish):**
    - Added global noise texture overlay in `index.tsx`.
    - Added background grid pattern in `Hero` section.
    - Enhanced `GlassCard` with gradient borders, inner sheen effects, and micro-noise.
    - Added abstract visual placeholders (gradients) for Projects cards.
    - Improved typography and gradients in Hero section.
    - Added floating decorative elements in Hero section.

### Notes
- Used pure Tailwind CSS v4 for styling to avoid installing extra dependencies like `clsx` or `tailwind-merge` if they were missing (implemented simple replacement).
- Assumed `lucide-react` is available as per `package.json`.
- Did not install `daisyui` despite user mention, to strictly follow "No Install" rule, but code is compatible with standard Tailwind.
