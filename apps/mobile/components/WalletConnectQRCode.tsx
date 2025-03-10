import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface WalletConnectQRCodeProps {
  uri: string;
  visible: boolean;
  onClose: () => void;
}

const WalletConnectQRCode: React.FC<WalletConnectQRCodeProps> = ({ uri, visible, onClose }) => {
  if (!uri) return null;
  
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Scan with WalletConnect</Text>
          <View style={styles.qrContainer}>
            <QRCode
              value={uri}
              size={250}
              backgroundColor="white"
              color="black"
            />
          </View>
          <Text style={styles.description}>
            Open your WalletConnect-compatible wallet app and scan this QR code to connect
          </Text>
          
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  qrContainer: {
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
  description: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  closeButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  closeText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default WalletConnectQRCode; 