import { View, Text, StyleSheet } from "react-native";

export const TestBox = () => {
  return (
    <View>
      <View style={styles.container}>
        <Text style={styles.text}>This is a test box with direct styles</Text>
      </View>
      {/* nativewind styles */}
      <View className="bg-red-500 p-4 m-4 rounded-lg border-4 border-blue-500">
        <Text className="text-white font-bold">This is a test box with nativewind styles</Text>
      </View>
    </View>

  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'red',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderWidth: 4,
    borderColor: 'blue',
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
  }
}); 