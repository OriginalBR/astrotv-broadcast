/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        condensed: ['"Barlow Condensed"', 'Oswald', 'sans-serif'],
        bebas: ['"Bebas Neue"', 'sans-serif'],
        teko: ['Teko', 'sans-serif'],
        syne: ['Syne', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        broadcast: {
          bg: '#0a0d14',
          surface: '#111622',
          card: '#161d2d',
          border: '#1f293d',
          accent: '#e63946',
          yellow: '#ffd166',
          green: '#06d6a0',
          blue: '#118ab2',
          darkBlue: '#073b4c',
          glow: '#3b82f6',
          live: '#ff0033',
        }
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ticker': 'ticker 25s linear infinite',
        'shine': 'shine 2s infinite',
        'scale-bounce': 'scaleBounce 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-left': 'slideLeft 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-right': 'slideRight 0.4s cubic-bezier(0.05, 0.9, 0.1, 1.05)',
        'fade-in': 'fadeIn 0.3s ease-out',
        'wipe-left': 'wipeLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        
        // Advanced Broadcast Motion Design Suite (Entries)
        'blade-sweep': 'bladeSweep 0.45s cubic-bezier(0.05, 0.9, 0.1, 1.05) forwards',
        'curtain-reveal': 'curtainReveal 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'elastic-snap': 'elasticSnap 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.35) forwards',
        'flip-unfold': 'flipUnfold 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'headline-shutter': 'headlineShutter 0.4s cubic-bezier(0.05, 0.9, 0.1, 1.05) forwards',
        'neon-flare': 'neonFlare 0.5s ease-out forwards',
        'smooth-glide': 'smoothGlide 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'glitch-tv': 'glitchTv 0.35s ease-in-out',

        // Broadcast Exits
        'exit-slide-left': 'exitSlideLeft 0.35s cubic-bezier(0.7, 0, 0.84, 0) forwards',
        'exit-slide-down': 'exitSlideDown 0.35s cubic-bezier(0.7, 0, 0.84, 0) forwards',
        'exit-blade-retract': 'exitBladeRetract 0.35s cubic-bezier(0.7, 0, 0.84, 0) forwards',
        'exit-fade-blur': 'exitFadeBlur 0.3s ease-in forwards',
        'exit-glitch-dissolve': 'exitGlitchDissolve 0.3s ease-in forwards',
        'exit-3d-fold': 'exit3dFold 0.35s cubic-bezier(0.7, 0, 0.84, 0) forwards',
        'exit-elastic-collapse': 'exitElasticCollapse 0.35s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shine: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        scaleBounce: {
          '0%': { transform: 'scale(0.75)', opacity: '0' },
          '70%': { transform: 'scale(1.04)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-120%)', opacity: '0' },
          '80%': { transform: 'translateX(2%)', opacity: '1' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', filter: 'blur(4px)' },
          '100%': { opacity: '1', filter: 'blur(0)' },
        },
        wipeLeft: {
          '0%': { clipPath: 'inset(0 100% 0 0)' },
          '100%': { clipPath: 'inset(0 0 0 0)' },
        },
        
        // Advanced Broadcast Entries
        bladeSweep: {
          '0%': { clipPath: 'polygon(0 0, 0 0, 0 100%, 0% 100%)', transform: 'translateX(-40px)' },
          '100%': { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', transform: 'translateX(0)' },
        },
        curtainReveal: {
          '0%': { clipPath: 'inset(0 50% 0 50%)', opacity: '0', transform: 'scale(0.95)' },
          '100%': { clipPath: 'inset(0 0% 0 0%)', opacity: '1', transform: 'scale(1)' },
        },
        elasticSnap: {
          '0%': { transform: 'translateX(-140%) skewX(-12deg)', opacity: '0' },
          '70%': { transform: 'translateX(15px) skewX(4deg)', opacity: '1' },
          '90%': { transform: 'translateX(-5px) skewX(-1deg)' },
          '100%': { transform: 'translateX(0) skewX(0deg)', opacity: '1' },
        },
        flipUnfold: {
          '0%': { transform: 'perspective(1000px) rotateX(-90deg)', transformOrigin: 'top', opacity: '0' },
          '70%': { transform: 'perspective(1000px) rotateX(15deg)', transformOrigin: 'top' },
          '100%': { transform: 'perspective(1000px) rotateX(0deg)', transformOrigin: 'top', opacity: '1' },
        },
        headlineShutter: {
          '0%': { clipPath: 'inset(100% 0 0 0)', transform: 'translateY(40px)', opacity: '0' },
          '100%': { clipPath: 'inset(0 0 0 0)', transform: 'translateY(0)', opacity: '1' },
        },
        neonFlare: {
          '0%': { opacity: '0', filter: 'brightness(2.5) contrast(1.5)', transform: 'scale(0.9)' },
          '50%': { opacity: '1', filter: 'brightness(1.8)' },
          '100%': { opacity: '1', filter: 'brightness(1) contrast(1)', transform: 'scale(1)' },
        },
        smoothGlide: {
          '0%': { transform: 'translateY(60px) scale(0.96)', opacity: '0', filter: 'blur(8px)' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1', filter: 'blur(0)' },
        },
        glitchTv: {
          '0%': { transform: 'translate(0)', filter: 'hue-rotate(0deg)' },
          '20%': { transform: 'translate(-4px, 3px)', filter: 'hue-rotate(90deg)' },
          '40%': { transform: 'translate(4px, -2px)', filter: 'hue-rotate(180deg)' },
          '60%': { transform: 'translate(-3px, 1px)' },
          '80%': { transform: 'translate(2px, -3px)' },
          '100%': { transform: 'translate(0)', filter: 'hue-rotate(0deg)' },
        },

        // Broadcast Exits
        exitSlideLeft: {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(-120%)', opacity: '0' },
        },
        exitSlideDown: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(120%)', opacity: '0' },
        },
        exitBladeRetract: {
          '0%': { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', transform: 'translateX(0)' },
          '100%': { clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)', transform: 'translateX(40px)', opacity: '0' },
        },
        exitFadeBlur: {
          '0%': { opacity: '1', filter: 'blur(0)' },
          '100%': { opacity: '0', filter: 'blur(12px)', transform: 'scale(0.95)' },
        },
        exitGlitchDissolve: {
          '0%': { transform: 'translate(0)', opacity: '1' },
          '30%': { transform: 'translate(6px, -4px)', filter: 'invert(1)' },
          '60%': { transform: 'translate(-6px, 4px)', opacity: '0.6' },
          '100%': { transform: 'translate(0)', opacity: '0' },
        },
        exit3dFold: {
          '0%': { transform: 'perspective(1000px) rotateX(0deg)', transformOrigin: 'bottom', opacity: '1' },
          '100%': { transform: 'perspective(1000px) rotateX(90deg)', transformOrigin: 'bottom', opacity: '0' },
        },
        exitElasticCollapse: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '30%': { transform: 'scale(1.08)' },
          '100%': { transform: 'scale(0.5)', opacity: '0' },
        },
      }
    },
  },
  plugins: [],
}
