/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#090a0f',
        cardBg: 'rgba(15, 18, 36, 0.4)',
        borderBg: 'rgba(255, 255, 255, 0.08)',
        cyberCyan: '#00f2fe',
        cyberPurple: '#4facfe',
        neonTeal: '#05g9c3',
        neonGreen: '#10b981',
        neonRed: '#f43f5e',
      },
      animation: {
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 242, 254, 0.2), 0 0 10px rgba(0, 242, 254, 0.1)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 242, 254, 0.6), 0 0 35px rgba(79, 172, 254, 0.4)' },
        }
      },
      backdropBlur: {
        cyber: '12px',
      }
    },
  },
  plugins: [],
}
