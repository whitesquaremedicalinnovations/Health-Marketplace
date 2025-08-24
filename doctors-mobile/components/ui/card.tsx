import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface CardProps {
  children?: React.ReactNode;
  style?: any;
  className?: string;
}

interface CardContentProps {
  children?: React.ReactNode;
  style?: any;
  className?: string;
}

export function Card({ children, style, className }: CardProps) {
  const { colors } = useTheme();
  
  return (
    <View style={[
      styles.card,
      { 
        backgroundColor: colors.background,
        borderColor: colors.border 
      },
      style,
      className
    ]}>
      {children}
    </View>
  );
}

export function CardContent({ children, style, className }: CardContentProps) {
  return (
    <View style={[styles.cardContent, style, className]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    marginVertical: 4,
  },
  cardContent: {
    padding: 16,
  },
}); 