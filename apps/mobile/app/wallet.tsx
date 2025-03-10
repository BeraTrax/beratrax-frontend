import ConnectWallet from '@/components/ConnectWallet';
import { useWallet } from '@/config/WalletProvider';
import { StyleSheet, Text, View } from 'react-native';

export default function WalletScreen() {
  const { isConnected, address, formattedBalance, currentNetwork, gasPrice } = useWallet();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Web3 Wallet</Text>
      
      <ConnectWallet />
      
      {isConnected && (
        <View style={styles.walletDetails}>
          <Text style={styles.detailTitle}>Wallet Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Address:</Text>
            <Text style={styles.detailValue}>{address}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Balance:</Text>
            <Text style={styles.detailValue}>{formattedBalance}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Network:</Text>
            <Text style={styles.detailValue}>{currentNetwork}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Gas Price:</Text>
            <Text style={styles.detailValue}>{gasPrice}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  walletDetails: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#111827',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  detailLabel: {
    width: 80,
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },
}); 