export const colors = {
  // Primary brand color
  primary: '#4F46E5', // Deep Indigo
  primaryLight: '#818CF8',
  primaryDark: '#3730A3',
  
  // Secondary color for accents
  secondary: '#0EA5E9', // Sky Blue
  
  // Backgrounds
  background: '#F8FAFC', // Slate 50
  surface: '#FFFFFF', // White
  
  // Text colors
  textDark: '#1E293B', // Slate 800
  textMuted: '#64748B', // Slate 500
  textLight: '#F8FAFC',
  
  // Status colors
  success: '#10B981', // Emerald
  successLight: '#D1FAE5',
  error: '#F43F5E', // Rose
  errorLight: '#FFE4E6',
  warning: '#F59E0B', // Amber
  warningLight: '#FEF3C7',
  
  // Borders
  border: '#E2E8F0', // Slate 200
  
  // Gradient arrays for react-native-linear-gradient
  gradients: {
    primary: ['#4F46E5', '#6366F1', '#818CF8'] as const, // Indigo gradient
    header: ['#1E1B4B', '#312E81', '#4F46E5'] as const,  // Dark Indigo gradient
    accent: ['#0EA5E9', '#38BDF8'] as const,              // Sky Blue gradient
  }
};
