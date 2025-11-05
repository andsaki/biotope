/**
 * Design Tokens
 * プロジェクト全体で使用するデザイントークンを定義
 */

export const colors = {
  // Paper-style design palette
  paperBg: 'rgba(245, 230, 211, 0.95)',
  paperBorder: '#d4a574',
  textPrimary: '#5d4e37',
  textSecondary: '#8b7355',
  accent: '#8b7355',
  white: '#ffffff',
} as const;

export const shadows = {
  sm: '0 2px 4px rgba(0, 0, 0, 0.1)',
  md: '0 4px 16px rgba(139, 115, 85, 0.3)',
  lg: '0 8px 32px rgba(0, 0, 0, 0.2)',
  inset: 'inset 0 2px 8px rgba(139, 115, 85, 0.2)',
} as const;

export const radius = {
  sm: '0.25rem',   // 4px
  md: '0.5rem',    // 8px
  lg: '1.25rem',   // 20px
  full: '50%',
} as const;

export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.75rem',   // 12px
  md: '1rem',      // 16px
  lg: '1.25rem',   // 20px
  xl: '2rem',      // 32px
} as const;

export const positioning = {
  pc: {
    top: '1.25rem',    // 20px
    right: '1.25rem',  // 20px
    left: '1.25rem',   // 20px
  },
  mobile: {
    top: '0.625rem',   // 10px
    right: '0.9375rem', // 15px
    left: '0.625rem',  // 10px
  },
} as const;

export const componentSizes = {
  pc: {
    clock: '16.25rem',   // 260px
    compass: '6.25rem',  // 100px
    button: '3.125rem',  // 50px
  },
  mobile: {
    clock: '8.75rem',    // 140px
    button: '3rem',      // 48px
  },
} as const;

export const typography = {
  fontFamily: {
    serif: "'Noto Serif JP', serif",
    mono: "'Courier New', monospace",
  },
} as const;

export const transitions = {
  fast: '0.2s ease',
  base: '0.3s ease',
  slow: '0.8s cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

export const zIndex = {
  base: 1,
  dropdown: 10,
  ui: 100,
  modal: 200,
} as const;

// Export all tokens as a single object
export const tokens = {
  colors,
  shadows,
  radius,
  spacing,
  positioning,
  componentSizes,
  typography,
  transitions,
  zIndex,
} as const;

export default tokens;
