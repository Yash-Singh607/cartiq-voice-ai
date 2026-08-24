/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Neutral canvas
        ink: {
          50:  '#f8f8f8', 100: '#f0f0f0', 200: '#e4e4e4', 300: '#d1d1d1',
          400: '#a3a3a3', 500: '#737373', 600: '#525252', 700: '#404040',
          800: '#262626', 900: '#171717', 950: '#0a0a0a',
        },
        slate: {
          50:  '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1',
          400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155',
          800: '#1e293b', 900: '#0f172a', 950: '#020617',
        },
        // Primary brand – Instacart Emerald Green
        brand: {
          50:  '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7',
          400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857',
          800: '#065f46', 900: '#064e3b', 950: '#022c22',
        },
        // Alexa Cyan
        alexa: {
          50:  '#ecfeff', 100: '#cffafe', 200: '#a5f3fc', 300: '#67e8f9',
          400: '#22d3ee', 500: '#06b6d4', 600: '#0891b2', 700: '#0e7490',
          800: '#155e75', 900: '#164e63', 950: '#083344',
        },
        emerald: {
          50: '#ecfdf5', 100: '#d1fae5', 400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857',
        },
        amber: {
          50: '#fffbeb', 100: '#fef3c7', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706',
        },
        rose: {
          50: '#fff1f2', 100: '#ffe4e6', 400: '#fb7185', 500: '#f43f5e', 600: '#e11d48',
        },
        violet: {
          50: '#f5f3ff', 100: '#ede9fe', 400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed',
        },
      },
      fontFamily: {
        sans:    ['"Inter"', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Inter"', 'ui-sans-serif', 'sans-serif'],
        mono:    ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
        '3xs': ['0.55rem',  { lineHeight: '0.85rem' }],
      },
      borderRadius: {
        '4xl': '2rem', '5xl': '2.5rem',
      },
      boxShadow: {
        'xs':      '0 1px 2px 0 rgb(0 0 0 / 0.04)',
        'sm':      '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card':    '0 2px 12px -2px rgb(15 23 42 / 0.08), 0 1px 3px -1px rgb(15 23 42 / 0.04)',
        'card-md': '0 4px 20px -4px rgb(15 23 42 / 0.12), 0 2px 6px -2px rgb(15 23 42 / 0.05)',
        'card-lg': '0 8px 32px -6px rgb(15 23 42 / 0.14), 0 4px 10px -4px rgb(15 23 42 / 0.06)',
        'glow-alexa':  '0 0 0 2px rgb(6 182 212 / 0.25), 0 0 20px rgb(6 182 212 / 0.15)',
        'glow-brand':  '0 0 0 2px rgb(5 150 105 / 0.25), 0 0 20px rgb(5 150 105 / 0.15)',
        'glow-emerald':'0 0 0 2px rgb(16 185 129 / 0.25), 0 0 16px rgb(16 185 129 / 0.12)',
        'inner':   'inset 0 1px 3px 0 rgb(0 0 0 / 0.06)',
      },
      animation: {
        'fade-in':      'fadeIn 0.25s ease-out',
        'slide-up':     'slideUp 0.35s cubic-bezier(0.16,1,0.3,1)',
        'slide-right':  'slideRight 0.35s cubic-bezier(0.16,1,0.3,1)',
        'scale-in':     'scaleIn 0.2s cubic-bezier(0.16,1,0.3,1)',
        'wave-bar':     'waveBar 1.1s ease-in-out infinite',
        'alexa-pulse':  'alexaPulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
        'alexa-ring':   'alexaRing 2s ease-out infinite',
        'shimmer':      'shimmer 2s linear infinite',
        'ticker':       'ticker 20s linear infinite',
        'bounce-badge': 'bounceBadge 0.5s cubic-bezier(0.36,0.07,0.19,0.97)',
        'float':        'float 5s ease-in-out infinite',
        'spin-slow':    'spin 4s linear infinite',
        'ping-slow':    'ping 2.5s cubic-bezier(0,0,0.2,1) infinite',
      },
      keyframes: {
        fadeIn:       { from: { opacity: '0' },                         to: { opacity: '1' } },
        slideUp:      { from: { opacity: '0', transform: 'translateY(14px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideRight:   { from: { opacity: '0', transform: 'translateX(-12px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        scaleIn:      { from: { opacity: '0', transform: 'scale(0.94)' }, to: { opacity: '1', transform: 'scale(1)' } },
        waveBar:      { '0%,100%': { transform: 'scaleY(0.35)' }, '50%': { transform: 'scaleY(1)' } },
        alexaPulse:   { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.4' } },
        alexaRing:    { '0%': { transform: 'scale(1)', opacity: '0.6' }, '100%': { transform: 'scale(2.5)', opacity: '0' } },
        shimmer:      { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        ticker:       { '0%': { transform: 'translateX(100%)' }, '100%': { transform: 'translateX(-100%)' } },
        bounceBadge:  { '0%,100%': { transform: 'scale(1)' }, '30%': { transform: 'scale(1.35)' }, '60%': { transform: 'scale(0.9)' } },
        float:        { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
      },
      backgroundImage: {
        'shimmer-gradient':  'linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.7) 50%, transparent 75%)',
        'mesh-blue':         'radial-gradient(at 30% 20%, rgb(37 99 235 / 0.08) 0px, transparent 50%), radial-gradient(at 80% 10%, rgb(6 182 212 / 0.07) 0px, transparent 50%), radial-gradient(at 10% 70%, rgb(139 92 246 / 0.05) 0px, transparent 50%)',
        'mesh-morning':      'linear-gradient(135deg, rgb(254 215 170 / 0.3) 0%, rgb(254 249 195 / 0.2) 50%, rgb(207 250 254 / 0.3) 100%)',
        'mesh-afternoon':    'linear-gradient(135deg, rgb(207 250 254 / 0.3) 0%, rgb(220 252 231 / 0.2) 50%, rgb(254 249 195 / 0.2) 100%)',
        'mesh-evening':      'linear-gradient(135deg, rgb(237 233 254 / 0.3) 0%, rgb(252 231 243 / 0.2) 50%, rgb(254 215 170 / 0.2) 100%)',
        'mesh-night':        'linear-gradient(135deg, rgb(15 23 42 / 0.08) 0%, rgb(30 27 75 / 0.06) 50%, rgb(15 23 42 / 0.04) 100%)',
        'alexa-gradient':    'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 40%, #2563eb 100%)',
        'card-shimmer':      'linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%)',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.16, 1, 0.3, 1)',
        bounce: 'cubic-bezier(0.36, 0.07, 0.19, 0.97)',
      },
    },
  },
  plugins: [],
}
