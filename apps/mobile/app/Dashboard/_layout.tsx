import { LocalNested } from "@/components/LocalNested"
import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { Button, ButtonTwo, Reusable, TestBox, WalletAndStakingPoint } from "@beratrax/ui"
import { Ionicons } from '@expo/vector-icons'
import { Image, ScrollView, StyleSheet, TouchableOpacity, Text } from "react-native"

const Dashboard = () => {
  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Wallet Address Section */}

        {/* <Reusable title="Hello From Beratrax UI" /> */}
        <Button />
        <WalletAndStakingPoint />
        <ButtonTwo />

        <LocalNested className="p-4">
          <Text>Local nested</Text>
        </LocalNested>

          <ThemedView style={styles.addressPill}>
            <Ionicons name="leaf" size={18} color="#72B21F" style={styles.addressIcon} />
            <ThemedText style={styles.addressText}>0x27...55982F56</ThemedText>
            <TouchableOpacity style={styles.copyButton}>
              <Ionicons name="copy-outline" size={16} color="#fff" />
            </TouchableOpacity>
          </ThemedView>
        {/* <TestBox /> */}
      </ScrollView>
    </ThemedView>
  )
}


export default Dashboard

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#020907', // Using bgDark from theme
  },
  scrollView: {
    flex: 1,
    paddingTop: 12,
  },
  addressSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
    justifyContent: 'center',
  },
  addressPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  addressIcon: {
    marginRight: 6,
  },
  addressText: {
    fontSize: 14,
    color: '#fff',
  },
  copyButton: {
    marginLeft: 8,
  }
});
