import type { Config } from 'tailwindcss'

// Tailwind CSS v4: most config lives in globals.css @theme block.
// This file is kept for content path configuration and dark mode strategy.
const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
}

export default config
