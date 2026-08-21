import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          50:  '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
          light: '#93BFEA',
        },
        success: {
          DEFAULT: '#16A34A',
          50:  '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
        },
        warning: {
          DEFAULT: '#D97706',
          50:  '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        },
        danger: {
          DEFAULT: '#EF4444',
          50:  '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
        },
        text: {
          primary:   '#1F1F2A',
          secondary: '#475569',
          muted:     '#94A3B8',
        },
        border:     '#E2E8F0',
        background: '#F8FAFE',
        surface:    '#FFFFFF',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': ['48px', { fontWeight: '700', lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'h1':      ['32px', { fontWeight: '700', lineHeight: '1.25', letterSpacing: '-0.01em' }],
        'h2':      ['24px', { fontWeight: '600', lineHeight: '1.35' }],
        'h3':      ['20px', { fontWeight: '600', lineHeight: '1.4'  }],
        'h4':      ['18px', { fontWeight: '600', lineHeight: '1.4'  }],
        'body-lg': ['16px', { fontWeight: '400', lineHeight: '1.6'  }],
        'body-md': ['14px', { fontWeight: '400', lineHeight: '1.6'  }],
        'body-sm': ['12px', { fontWeight: '400', lineHeight: '1.5'  }],
      },
      boxShadow: {
        'card':       '0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.06)',
        'card-hover': '0 10px 25px -5px rgba(37,99,235,0.12), 0 4px 10px -4px rgba(37,99,235,0.08)',
        'nav':        '0 1px 3px 0 rgba(0,0,0,0.06)',
        'modal':      '0 25px 50px -12px rgba(0,0,0,0.2)',
        'btn':        '0 4px 14px 0 rgba(37,99,235,0.35)',
        'feature':    '0 4px 24px -4px rgba(37,99,235,0.1)',
      },
      borderRadius: {
        DEFAULT: '8px',
        'sm':   '6px',
        'md':   '8px',
        'lg':   '12px',
        'xl':   '16px',
        '2xl':  '20px',
        '3xl':  '24px',
        'pill': '9999px',
      },
      backgroundImage: {
        'gradient-hero':    'linear-gradient(135deg, #EFF6FF 0%, #F8FAFE 50%, #EFF6FF 100%)',
        'gradient-primary': 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
        'gradient-card':    'linear-gradient(135deg, #FFFFFF 0%, #F8FAFE 100%)',
        'gradient-success': 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
      },
      animation: {
        'fade-up':    'fadeUp 0.5s ease-out',
        'fade-in':    'fadeIn 0.4s ease-out',
        'slide-in':   'slideIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float':      'float 3s ease-in-out infinite',
        'bounce-sm':  'bounceSm 1s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%':   { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        bounceSm: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-4px)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
