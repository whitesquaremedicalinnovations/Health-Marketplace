import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface CalendarProps {
  selected?: Date;
  onSelect?: (date: Date) => void;
  modifiers?: {
    [key: string]: (date: Date) => boolean;
  };
  modifiersClassNames?: {
    [key: string]: string;
  };
  components?: {
    DayButton?: React.ComponentType<any>;
  };
  style?: any;
  mode?: 'single' | 'multiple' | 'range';
}

interface DayButtonProps {
  day: { date: Date };
  modifiers: { [key: string]: boolean };
  style?: any;
  children?: React.ReactNode;
  [key: string]: any;
}

function CalendarDayButton({ day, modifiers, style, children, ...props }: DayButtonProps) {
  const { colors } = useTheme();
  
  return (
    <TouchableOpacity
      style={[
        styles.dayButton,
        modifiers.selected && { backgroundColor: colors.primary },
        style
      ]}
      {...props}
    >
      <Text style={[
        styles.dayText,
        modifiers.selected && { color: '#ffffff' }
      ]}>
        {day.date.getDate()}
      </Text>
      {children}
    </TouchableOpacity>
  );
}

export function Calendar({
  selected,
  onSelect,
  modifiers = {},
  modifiersClassNames = {},
  components = {},
  style,
  mode = 'single'
}: CalendarProps) {
  const { colors } = useTheme();
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const days = [];
    
    // Add empty days for padding
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };
  
  const days = getDaysInMonth(currentMonth);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  const DayButtonComponent = components.DayButton || CalendarDayButton;
  
  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
          <Text style={styles.navText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthText}>
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </Text>
        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <Text style={styles.navText}>›</Text>
        </TouchableOpacity>
      </View>
      
      {/* Week days */}
      <View style={styles.weekDays}>
        {weekDays.map(day => (
          <Text key={day} style={styles.weekDayText}>{day}</Text>
        ))}
      </View>
      
      {/* Calendar grid */}
      <View style={styles.calendarGrid}>
        {days.map((date, index) => {
          if (!date) {
            return <View key={`empty-${index}`} style={styles.emptyDay} />;
          }
          
          const dayModifiers: { [key: string]: boolean } = {};
          Object.keys(modifiers).forEach(key => {
            dayModifiers[key] = modifiers[key](date);
          });
          
          const isSelected = selected && date.toDateString() === selected.toDateString();
          if (isSelected) {
            dayModifiers.selected = true;
          }
          
          return (
            <DayButtonComponent
              key={date.toISOString()}
              day={{ date }}
              modifiers={dayModifiers}
              onPress={() => onSelect?.(date)}
              style={[
                styles.day,
                dayModifiers.selected && { backgroundColor: colors.primary }
              ]}
            >
              <Text style={[
                styles.dayNumber,
                dayModifiers.selected && { color: '#ffffff' }
              ]}>
                {date.getDate()}
              </Text>
            </DayButtonComponent>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  day: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  emptyDay: {
    width: '14.28%',
    aspectRatio: 1,
  },
});

export { CalendarDayButton }; 