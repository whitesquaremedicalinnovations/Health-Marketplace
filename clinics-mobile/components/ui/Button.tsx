import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  leftIcon,
  rightIcon,
  style,
  disabled,
  ...props
}: ButtonProps) {
  const { colors } = useTheme();

  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[size]];
    
    switch (variant) {
      case 'primary':
        return [
          ...baseStyle,
          { backgroundColor: colors.primary },
          disabled && { backgroundColor: colors.muted },
        ];
      case 'secondary':
        return [
          ...baseStyle,
          { backgroundColor: colors.secondary },
          disabled && { backgroundColor: colors.muted },
        ];
      case 'outline':
        return [
          ...baseStyle,
          { 
            backgroundColor: 'transparent', 
            borderWidth: 1, 
            borderColor: colors.primary 
          },
          disabled && { borderColor: colors.muted },
        ];
      case 'ghost':
        return [
          ...baseStyle,
          { backgroundColor: 'transparent' },
        ];
      default:
        return baseStyle;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
      case 'secondary':
        return [
          styles.text,
          styles[`${size}Text`],
          { color: '#ffffff' },
          disabled && { color: colors.background },
        ];
      case 'outline':
        return [
          styles.text,
          styles[`${size}Text`],
          { color: colors.primary },
          disabled && { color: colors.muted },
        ];
      case 'ghost':
        return [
          styles.text,
          styles[`${size}Text`],
          { color: colors.primary },
          disabled && { color: colors.muted },
        ];
      default:
        return [styles.text, styles[`${size}Text`], { color: colors.text }];
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'outline' || variant === 'ghost' ? colors.primary : '#ffffff'} 
        />
      ) : (
        <>
          {leftIcon}
          <Text style={getTextStyle()}>{title}</Text>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    gap: 8,
  },
  small: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 32,
  },
  medium: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 40,
  },
  large: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    minHeight: 48,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
});