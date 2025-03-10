// import { useWallet } from '@/config/WalletProvider';
import { StyleSheet, Text, View } from 'react-native';

export default function WalletScreen() {
  // const { address, isConnected, disconnect } = useWallet();

  return (
    <View>
      <Text>Hello</Text>
    </View>
    // <SafeAreaView style={styles.container}>
    //   <View style={styles.content}>
    //     <Text style={styles.title}>Wallet</Text>
        
    //     {address ? (
    //       <View style={styles.walletInfo}>
    //         <Text style={styles.label}>Connected Address:</Text>
    //         <Text style={styles.address}>{address}</Text>
    //         <Text style={styles.connectionType}>
    //           Connected via: {isConnected ? 'Social Login' : 'WalletConnect'}
    //         </Text>
            
    //         <TouchableOpacity style={styles.logoutButton} onPress={disconnect}>
    //           <Text style={styles.logoutText}>Disconnect</Text>
    //         </TouchableOpacity>
    //       </View>
    //     ) : (
    //       <View style={styles.connectContainer}>
    //         <Text style={styles.connectPrompt}>
    //           Connect your wallet to access your assets and make transactions.
    //         </Text>
    //         <ConnectWallet />
    //       </View>
    //     )}
    //   </View>
    // </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  walletInfo: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  address: {
    fontSize: 16,
    color: '#333',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 16,
    fontFamily: 'monospace',
  },
  connectionType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#f44336',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  connectContainer: {
    flex: 1, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectPrompt: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 40,
  },
}); 