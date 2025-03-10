import { useWallet } from '@/config/WalletProvider';
import { socialWallets } from '@/config/walletConfig';
import { useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const ConnectWallet = () => {
  const { isConnected, address, connect, disconnect, formattedBalance, currentNetwork, gasPrice } = useWallet();
  const [modalVisible, setModalVisible] = useState(false);

  const handleConnect = async (connectorId: string) => {
    try {
      await connect(connectorId);
      setModalVisible(false);
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <View style={styles.container}>
      {isConnected ? (
        <View style={styles.connectedContainer}>
          <View style={styles.walletInfo}>
            <Text style={styles.addressText}>{truncateAddress(address || '')}</Text>
            <Text style={styles.balanceText}>{formattedBalance}</Text>
            <Text style={styles.networkText}>{currentNetwork} • {gasPrice}</Text>
          </View>
          <TouchableOpacity 
            style={styles.disconnectButton}
            onPress={handleDisconnect}
          >
            <Text style={styles.disconnectText}>Disconnect</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.connectButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.connectText}>Connect Wallet</Text>
        </TouchableOpacity>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Connect Your Wallet</Text>
            <Text style={styles.modalSubtitle}>Choose your preferred login method</Text>
            
            <FlatList
              data={socialWallets}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.walletOption}
                  onPress={() => handleConnect(item.id)}
                >
                  <View style={[styles.walletIcon, 
                    item.id === 'google' && styles.googleIcon,
                    item.id === 'facebook' && styles.facebookIcon,
                    item.id === 'discord' && styles.discordIcon,
                    item.id === 'twitter' && styles.twitterIcon,
                    item.id === 'github' && styles.githubIcon,
                  ]} />
                  <Text style={styles.walletName}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  connectButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  connectedContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
  },
  walletInfo: {
    flex: 1,
  },
  addressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  balanceText: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 4,
  },
  networkText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  disconnectButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  disconnectText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  walletOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  walletIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#DDD',
    borderRadius: 16,
    marginRight: 12,
  },
  googleIcon: {
    backgroundColor: '#DB4437',
  },
  facebookIcon: {
    backgroundColor: '#4267B2',
  },
  discordIcon: {
    backgroundColor: '#5865F2',
  },
  twitterIcon: {
    backgroundColor: '#1DA1F2',
  },
  githubIcon: {
    backgroundColor: '#333',
  },
  walletName: {
    fontSize: 16,
    color: '#1F2937',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeText: {
    color: '#4B5563',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ConnectWallet; 