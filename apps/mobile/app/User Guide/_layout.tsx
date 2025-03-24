import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { Link } from "expo-router"
import { StyleSheet } from "react-native"

const UserGuide = () => {
  return (
    <ThemedView style={styles.container}>
    <ThemedText type="title">User Guide</ThemedText>
    <Link href=".." style={styles.link}>
      <ThemedText type="link">Go to home screen!</ThemedText>
    </Link>
  </ThemedView>
  )
}

export default UserGuide

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
