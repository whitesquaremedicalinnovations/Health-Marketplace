/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * Primary color: Blue variations
 * Secondary color: Teal/Cyan variations
 */

const primaryColor = '#2563EB'; // Blue-600 (darker)
const primaryColorDark = '#3B82F6'; // Blue-500 for dark mode
const secondaryColor = '#06B6D4'; // Cyan-500
const secondaryColorDark = '#22D3EE'; // Cyan-400 for dark mode

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
