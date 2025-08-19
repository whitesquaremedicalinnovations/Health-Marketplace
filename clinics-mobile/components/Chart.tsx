import React from 'react';
import { View, Text } from "react-native";
import { PieChart } from "react-native-gifted-charts";

interface Props {
  data: number[];
  colors: string[];
  title: string;
}

export default function Chart({ data, colors, title }: Props) {
  const pieData = data.map((value, index) => ({
    value,
    color: colors[index],
    gradientCenterColor: colors[index],
  }));

  return (
    <View style={{
      justifyContent: 'center', 
      alignItems: 'center',
    }}>
      {data.length > 0 ? (
        <PieChart
          data={pieData}
          donut
          showGradient
          sectionAutoFocus
          radius={50}
          innerRadius={30}
          centerLabelComponent={() => {
            const total = data.reduce((a, b) => a + b, 0);
            return (
              <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 18, color: '#1f2937', fontWeight: 'bold' }}>
                  {total}
                </Text>
              </View>
            );
          }}
        />
      ) : (
        <Text>No data</Text>
      )}
    </View>
  );
} 