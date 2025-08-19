import { View, type ViewProps } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  variant?: 'default' | 'surface' | 'surfaceSecondary';
};

export function ThemedView({ 
  style, 
  lightColor, 
  darkColor, 
  variant = 'default',
  ...otherProps 
}: ThemedViewProps) {
  const { colors, isDark } = useTheme();
  
  let backgroundColor: string;
  
  if (lightColor && darkColor) {
    backgroundColor = isDark ? darkColor : lightColor;
  } else if (lightColor || darkColor) {
    backgroundColor = (lightColor || darkColor) as string;
  } else {
    switch (variant) {
      case 'surface':
        backgroundColor = colors.surface;
        break;
      case 'surfaceSecondary':
        backgroundColor = colors.surfaceSecondary;
        break;
      default:
        backgroundColor = colors.background;
        break;
    }
  }

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
