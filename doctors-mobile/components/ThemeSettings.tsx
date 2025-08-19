import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { Ionicons } from '@expo/vector-icons';

export function ThemeSettings() {
  const { themeMode, setThemeMode, colors } = useTheme();

  const themeOptions = [
    { key: 'system', label: 'System', icon: 'phone-portrait-outline' },
    { key: 'light', label: 'Light', icon: 'sunny-outline' },
    { key: 'dark', label: 'Dark', icon: 'moon-outline' },
  ] as const;

  return (
    <ThemedView variant="surface" style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        Theme Settings
      </ThemedText>
      
      <View style={styles.optionsContainer}>
        {themeOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.option,
              { borderColor: colors.border },
              themeMode === option.key && { 
                backgroundColor: colors.primary + '20',
                borderColor: colors.primary 
              }
            ]}
            onPress={() => setThemeMode(option.key)}
          >
            <View style={styles.optionContent}>
              <Ionicons
                name={option.icon as any}
                size={24}
                color={themeMode === option.key ? colors.primary : colors.icon}
              />
              <ThemedText
                type={themeMode === option.key ? 'primary' : 'default'}
                style={styles.optionLabel}
              >
                {option.label}
              </ThemedText>
            </View>
            {themeMode === option.key && (
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={colors.primary}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>
      
      <ThemedText type="muted" style={styles.description}>
        System theme will automatically switch between light and dark modes based on your device settings.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    margin: 16,
  },
  title: {
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  description: {
    textAlign: 'center',
    lineHeight: 20,
  },
});