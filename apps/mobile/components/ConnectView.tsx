import { ConnectButton } from '@reown/appkit-wagmi-react-native'
import { View } from 'react-native'
export default function ConnectView() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ConnectButton label="Connect Wallet" loadingLabel="Connecting..." />
    </View>
  )
}