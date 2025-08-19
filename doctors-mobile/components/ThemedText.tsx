import { StyleSheet, Text, type TextProps } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'primary' | 'secondary' | 'muted';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const { colors, isDark } = useTheme();
  
  let color: string;
  
  if (lightColor && darkColor) {
    color = isDark ? darkColor : lightColor;
  } else if (lightColor || darkColor) {
    color = (lightColor || darkColor) as string;
  } else {
    switch (type) {
      case 'primary':
        color = colors.primary;
        break;
      case 'secondary':
        color = colors.secondary;
        break;
      case 'muted':
        color = colors.muted;
        break;
      case 'link':
        color = colors.primary;
        break;
      default:
        color = colors.text;
        break;
    }
  }

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        type === 'primary' ? styles.primary : undefined,
        type === 'secondary' ? styles.secondary : undefined,
        type === 'muted' ? styles.muted : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    fontWeight: '500',
  },
  primary: {
    fontWeight: '600',
  },
  secondary: {
    fontWeight: '600',
  },
  muted: {
    fontSize: 14,
  },
});
