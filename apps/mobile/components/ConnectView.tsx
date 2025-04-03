import { mobileWalletConfig } from "@/config/mobileWalletConfig";
import useWallet from "@beratrax/core/src/hooks/useWallet";
import { ConnectButton } from "@reown/appkit-wagmi-react-native";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAccount, useBalance, useDisconnect } from "wagmi";

export default function ConnectView() {
  const {} = useWallet();
  // Get wallet connection info using wagmi hooks
  const { address, isConnected, status } = useAccount();
  const { data: balanceData } = useBalance({
    address: address,
    // Only fetch when we have an address
    config: mobileWalletConfig,
  });
  // Add disconnect hook
  const { disconnect } = useDisconnect();

  // Provide haptic feedback on connection state change
  useEffect(() => {
    if (status === "connected") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (status === "disconnected") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [status]);

  // Format address for display (0x1234...5678)
  const formatAddress = useCallback((addr: string | undefined) => {
    if (!addr) return "Not connected";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  }, []);

  // Handle disconnect with haptic feedback
  const handleDisconnect = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    disconnect();
  }, [disconnect]);

  return (
    <View style={[styles.container]}>
      {/* Connection status indicator */}
      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusDot,
            {
              backgroundColor:
                status === "connected"
                  ? "#4ade80"
                  : status === "connecting"
                    ? "#facc15"
                    : "#ef4444",
            },
          ]}
        />
        <Text style={styles.statusText}>Status: {status}</Text>
      </View>

      {/* Display wallet info when connected */}
      {isConnected && (
        <View style={styles.walletInfo}>
          <Text style={styles.infoText}>Address: {formatAddress(address)}</Text>
          {balanceData && (
            <Text style={styles.infoText}>
              Balance: {parseFloat(balanceData?.formatted).toFixed(4)}{" "}
              {balanceData?.symbol}
            </Text>
          )}
        </View>
      )}

      {/* Connection button */}
      {!isConnected ? (
        <ConnectButton label="Connect Wallet" loadingLabel="Connecting..." />
      ) : (
        <TouchableOpacity
          style={styles.disconnectButton}
          onPress={handleDisconnect}
          activeOpacity={0.7}
        >
          <Text style={styles.disconnectButtonText}>Disconnect Wallet</Text>
        </TouchableOpacity>
      )}

      {/* Display debug info if there's an issue */}
      {status === "disconnected" && (
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>
            If you're experiencing connection issues, check:
          </Text>
          <Text style={styles.debugItem}>• Your internet connection</Text>
          <Text style={styles.debugItem}>
            • WalletConnect projectId is valid
          </Text>
          <Text style={styles.debugItem}>
            • Allowed origins in WalletConnect dashboard
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "500",
  },
  walletInfo: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.05)",
    width: "100%",
    alignItems: "center",
  },
  infoText: {
    fontSize: 14,
    marginVertical: 3,
  },
  disconnectButton: {
    backgroundColor: "#ef4444",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 200,
    alignItems: "center",
  },
  disconnectButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  debugContainer: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "rgba(239,68,68,0.1)",
    width: "100%",
  },
  debugText: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 10,
  },
  debugItem: {
    fontSize: 13,
    marginLeft: 10,
    marginVertical: 3,
  },
});
