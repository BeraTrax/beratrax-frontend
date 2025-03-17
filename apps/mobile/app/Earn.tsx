import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { Card, Flex, StakingCard, Wow } from "@beratrax/ui"
import { Link } from "expo-router"
import { StyleSheet } from "react-native"

const Earn = () => {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Earn</ThemedText>
      <Wow />
      <Flex>
        <Link href="/Dashboard" style={styles.link}>
          <ThemedText type="link">Go to home screen!</ThemedText>
        </Link>
        <Card>
          <ThemedText type="defaultSemiBold">Go to home screen!</ThemedText>
        </Card>
      </Flex>
      <StakingCard
        isConnected={true}
        walletAddress={"0x1234567890123456789012345678901234567890"}
        ensName={"test.eth"}
        referralCode={"1234567890"}
        totalStaked={100}
      />
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
