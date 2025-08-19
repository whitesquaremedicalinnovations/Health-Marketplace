/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * Primary color: oklch(0.623 0.214 259.815) - converted to hex #6366F1
 * Secondary color: Green variations
 */

const primaryColor = '#6366F1'; // oklch(0.623 0.214 259.815)
const primaryColorDark = '#8B5CF6'; // Lighter variant for dark mode
const secondaryColor = '#10B981'; // Emerald green
const secondaryColorDark = '#34D399'; // Lighter green for dark mode

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    surface: '#f8fafc',
    surfaceSecondary: '#f1f5f9',
    primary: primaryColor,
    secondary: secondaryColor,
    tint: primaryColor,
    icon: '#64748b',
    tabIconDefault: '#94a3b8',
    tabIconSelected: primaryColor,
    border: '#e2e8f0',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    muted: '#6b7280',
  },
  dark: {
    text: '#f8fafc',
    background: '#0f172a',
    surface: '#1e293b',
    surfaceSecondary: '#334155',
    primary: primaryColorDark,
    secondary: secondaryColorDark,
    tint: primaryColorDark,
    icon: '#94a3b8',
    tabIconDefault: '#64748b',
    tabIconSelected: primaryColorDark,
    border: '#475569',
    success: '#34d399',
    warning: '#fbbf24',
    error: '#f87171',
    muted: '#9ca3af',
  },
};
