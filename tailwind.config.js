/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bg: '#0A0A0F',
        surface: '#12121A',
        card: '#1A1A26',
        cardHover: '#1F1F30',
        border: '#2A2A3A',
        borderLight: '#353548',
        accent: '#7C5CFC',
        accentSoft: '#4F3AA8',
        accentMuted: 'rgba(124, 92, 252, 0.15)',
        green: '#2FE5A3',
        greenMuted: 'rgba(47, 229, 163, 0.12)',
        orange: '#FF7A3D',
        orangeMuted: 'rgba(255, 122, 61, 0.12)',
        red: '#FF4D6D',
        redMuted: 'rgba(255, 77, 109, 0.12)',
        blue: '#4DA6FF',
        blueMuted: 'rgba(77, 166, 255, 0.12)',
        textMain: '#F0F0FF',
        textSecondary: '#B8B8D0',
        muted: '#8888AA',
        dim: '#555570',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        xxl: '24px',
        xxxl: '32px',
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        full: '9999px',
      },
    },
  },
  plugins: [],
};
