import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { Link } from "expo-router"
import { StyleSheet } from "react-native"

const Stats = () => {
  return (
    <ThemedView style={styles.container}>
    <ThemedText type="title">Stats</ThemedText>
    <Link href="/Dashboard" style={styles.link}>
      <ThemedText type="link">Go to home screen!</ThemedText>
    </Link>
  </ThemedView>
  )
}

export default Stats

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
