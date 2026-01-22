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

### Notes
- Used pure Tailwind CSS v4 for styling to avoid installing extra dependencies like `clsx` or `tailwind-merge` if they were missing (implemented simple replacement).
- Assumed `lucide-react` is available as per `package.json`.
- Did not install `daisyui` despite user mention, to strictly follow "No Install" rule, but code is compatible with standard Tailwind.
