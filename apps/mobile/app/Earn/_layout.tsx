import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { Link } from "expo-router"
import { StyleSheet, View, Text } from "react-native"

const Earn = () => {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Earn</ThemedText>
      <Link href=".." style={styles.link}>
        <ThemedText type="link">Go to home screen!</ThemedText>
      </Link>
    </ThemedView>
  )
}

export default Earn

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
