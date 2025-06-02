/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cyberpunk/neon color palette
        'electric-blue': '#00FFFF',
        'neon-purple': '#9D00FF',
        'neon-pink': '#FF00FF',
        'neon-green': '#39FF14',
        'deep-space': '#0D0221',
        'cyber-black': '#0A0A0A',
        'cyber-dark': '#121212',
        'cyber-gray': '#1E1E1E',
        'cyber-light': '#2A2A2A',
        'holo-accent': '#FF00FF',
      },
      boxShadow: {
        'neon-blue': '0 0 5px #00FFFF, 0 0 10px #00FFFF, 0 0 15px #00FFFF',
        'neon-purple': '0 0 5px #9D00FF, 0 0 10px #9D00FF, 0 0 15px #9D00FF',
        'neon-green': '0 0 5px #39FF14, 0 0 10px #39FF14, 0 0 15px #39FF14',
        'neon-pink': '0 0 5px #FF00FF, 0 0 10px #FF00FF, 0 0 15px #FF00FF',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'gradient': 'gradient 8s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { textShadow: '0 0 5px #00FFFF, 0 0 10px #00FFFF' },
          '100%': { textShadow: '0 0 10px #00FFFF, 0 0 20px #00FFFF, 0 0 30px #00FFFF' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        gradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      backgroundImage: {
        'cyber-gradient': 'linear-gradient(45deg, #0D0221, #121212, #1E1E1E)',
        'neon-gradient': 'linear-gradient(45deg, #00FFFF, #9D00FF, #39FF14)',
        'holo-gradient': 'linear-gradient(135deg, rgba(255,0,255,0.5), rgba(0,255,255,0.5))',
      },
      backdropFilter: {
        'glass': 'blur(10px) saturate(180%)',
      },
    },
  },
  plugins: [],
}