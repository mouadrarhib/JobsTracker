/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#1B2430',
          soft: '#2A3444',
          dim: '#4A5568',
        },
        paper: {
          DEFAULT: '#FAF7F2',
          dim: '#F1EBE1',
          card: '#FFFFFF',
        },
        cobalt: '#2A78D6',
        saffron: {
          DEFAULT: '#D98E2B',
          soft: '#FBF0DE',
        },
        // Categorical pipeline-stage palette — validated order (CVD-safe adjacency),
        // see dataviz skill validator. Do not reorder without re-validating.
        orange: '#EB6834',
        aqua: '#1BAF7A',
        amber: '#EDA100',
        magenta: '#E87BA4',
        green: '#008300',
        red: '#E34948',
        violet: '#4A3AA7',
        // Score-tier status colors (separate namespace from categorical palette)
        good: '#0CA30C',
        warn: '#FAB219',
        critical: '#D03B3B',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(27, 36, 48, 0.06), 0 1px 1px rgba(27, 36, 48, 0.04)',
        panel: '0 12px 32px rgba(27, 36, 48, 0.18)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(24px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'slide-in': 'slideIn 0.22s ease-out',
        'fade-in': 'fadeIn 0.15s ease-out',
      },
    },
  },
  plugins: [],
}
