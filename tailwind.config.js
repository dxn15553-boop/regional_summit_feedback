/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./index.tsx",
        "./App.tsx",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./services/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Cormorant Garamond', 'Georgia', 'serif'],
            },
            colors: {
                midnight: {
                    50:  '#eef1f8',
                    100: '#d5ddef',
                    200: '#aabade',
                    300: '#7e96cc',
                    400: '#5272b9',
                    500: '#3656a3',
                    600: '#254089',
                    700: '#1b2f6e',
                    800: '#111d44',
                    900: '#0d1526',
                    950: '#060915',
                },
                gold: {
                    50:  '#fdf8e7',
                    100: '#faefc4',
                    200: '#f5de8d',
                    300: '#f0cc56',
                    400: '#ecbc2d',
                    DEFAULT: '#d4af37', // Burnished 24K gold
                    600: '#b8941f',
                    700: '#96760e',
                    800: '#735a09',
                    900: '#5a4506',
                    glow:  'rgba(212, 175, 55, 0.35)',
                    glow2: 'rgba(212, 175, 55, 0.15)',
                },
                champagne: '#f5f0e8',
                silver: '#b8b0a0',
            },
            boxShadow: {
                'gold':        '0 0 20px rgba(212, 175, 55, 0.3)',
                'gold-strong': '0 0 40px rgba(212, 175, 55, 0.55)',
                'gold-inset':  'inset 0 0 20px rgba(212, 175, 55, 0.15)',
                'glass':       '0 8px 40px 0 rgba(0, 0, 0, 0.5)',
                'card':        '0 2px 40px rgba(0,0,0,0.4)',
                'luxury':      '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,175,55,0.1)',
            },
            backgroundImage: {
                'midnight-gradient': 'linear-gradient(135deg, #060915 0%, #0d1526 50%, #111d44 100%)',
                'gold-gradient':     'linear-gradient(135deg, #b8941f 0%, #d4af37 50%, #ecbc2d 100%)',
                'card-gradient':     'linear-gradient(135deg, rgba(17,29,68,0.85) 0%, rgba(13,21,38,0.9) 100%)',
                'section-gradient':  'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(17,29,68,0.6) 100%)',
            },
            keyframes: {
                shake: {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '25%': { transform: 'translateX(-6px)' },
                    '75%': { transform: 'translateX(6px)' },
                },
                fadeIn: {
                    '0%':   { opacity: '0', transform: 'translateY(16px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                fadeUp: {
                    '0%':   { opacity: '0', transform: 'translateY(30px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideInRight: {
                    '0%':   { opacity: '0', transform: 'translateX(-20px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                aurora: {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%':      { backgroundPosition: '100% 50%' },
                },
                shimmer: {
                    '0%':   { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                starPulse: {
                    '0%':   { transform: 'scale(1)',    filter: 'drop-shadow(0 0 4px rgba(212,175,55,0.4))' },
                    '50%':  { transform: 'scale(1.25)', filter: 'drop-shadow(0 0 12px rgba(212,175,55,0.9))' },
                    '100%': { transform: 'scale(1)',    filter: 'drop-shadow(0 0 4px rgba(212,175,55,0.4))' },
                },
                glowPulse: {
                    '0%, 100%': { boxShadow: '0 0 15px rgba(212, 175, 55, 0.2)' },
                    '50%':      { boxShadow: '0 0 35px rgba(212, 175, 55, 0.6)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%':      { transform: 'translateY(-8px)' },
                },
                ripple: {
                    '0%':   { transform: 'scale(0.8)', opacity: '1' },
                    '100%': { transform: 'scale(2.4)', opacity: '0' },
                },
            },
            animation: {
                shake:         'shake 0.25s ease-in-out 0s 2',
                fadeIn:        'fadeIn 0.6s ease-out forwards',
                fadeUp:        'fadeUp 0.7s ease-out forwards',
                slideInRight:  'slideInRight 0.5s ease-out forwards',
                aurora:        'aurora 8s ease infinite',
                shimmer:       'shimmer 2.5s linear infinite',
                glowPulse:     'glowPulse 2s ease-in-out infinite',
                float:         'float 4s ease-in-out infinite',
                starPulse:     'starPulse 0.4s ease-out',
                ripple:        'ripple 1s ease-out forwards',
            }
        },
    },
    plugins: [
        require("tailwindcss-animate"),
    ],
}
