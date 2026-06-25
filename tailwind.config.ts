import type { Config } from 'tailwindcss';

const spaceMono = ['"Space Mono"', 'monospace'];

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: spaceMono,
        serif: spaceMono,
        mono: spaceMono,
      },
    },
  },
  plugins: [],
} satisfies Config;
