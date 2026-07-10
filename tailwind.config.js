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
            colors: {
                midnight: {
                    DEFAULT: '#050814', /* Deep Royal Navy */
                    dark: '#02040a',
                    light: '#0f172a',
                },
                gold: {
                    DEFAULT: '#d4af37',
                    dark: '#b8860b',
                    light: '#f0c93a',
                },
                royalblue: {
                    DEFAULT: '#1d4ed8',
                    dark: '#1e3a8a',
                    light: '#3b82f6',
                },
                rosepink: {
                    DEFAULT: '#be123c',
                    dark: '#881337',
                    light: '#e11d48',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Cormorant Garamond', 'serif'],
            }
        },
    },
    plugins: [],
}
