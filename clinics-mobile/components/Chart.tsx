import { View, Text } from "react-native";
import PieChart from "react-native-pie-chart";

interface Props {
  data: number[];
  colors: string[];
  title: string;
}

export default function Chart({ data, colors, title }: Props) {
  return (
    <View className="flex-1 bg-white rounded-lg p-4 shadow-md">
      <Text className="text-lg font-bold mb-2">{title}</Text>
      {data.length > 0 ? (
        <PieChart
          widthAndHeight={100}
          series={data}
          sliceColor={colors}
          coverRadius={0.6}
        />
      ) : (
        <Text>No data</Text>
      )}
    </View>
  );
} 