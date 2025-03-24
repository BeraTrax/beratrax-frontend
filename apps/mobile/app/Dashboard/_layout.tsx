import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { Reusable, Button } from "@beratrax/ui"
import { Ionicons } from '@expo/vector-icons'
import { Image, ScrollView, StyleSheet, TouchableOpacity, Text } from "react-native"

const Dashboard = () => {
  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Wallet Address Section */}
        <Reusable title="Hello From Beratrax UI" />
        <Button variant="primary" size="medium" title="Hello From Beratrax UI"  />
        {/* <Text style={{ color: "white" }}>Hello From Beratrax UI</Text> */}
        {/* <XStack style={styles.addressSection}> */}
          <ThemedView style={styles.addressPill}>
            <Ionicons name="leaf" size={18} color="#72B21F" style={styles.addressIcon} />
            <ThemedText style={styles.addressText}>0x27...55982F56</ThemedText>
            <TouchableOpacity style={styles.copyButton}>
              <Ionicons name="copy-outline" size={16} color="#fff" />
            </TouchableOpacity>
          </ThemedView>
        {/* </XStack> */}

        {/* Points from Staking */}
        {/* <Card variant="secondary" size="medium" style={styles.mainPointsCard}>
          <ThemedText style={styles.pointsLabel}>POINTS FROM STAKING</ThemedText>
          <ThemedText style={styles.pointsValue}>418.256</ThemedText>
          <Image 
            source={require('@beratrax/core/src/assets/images/btxTokenLogo.png')} 
            style={styles.jarIcon}
          />
        </Card> */}

        {/* Points Cards Row */}
        {/* <XStack style={styles.pointsRow}>
          <Card variant="dark" size="medium" style={styles.halfCard}>
            <ThemedText style={styles.smallCardLabel}>POINTS FROM REFERRALS</ThemedText>
            <ThemedText style={styles.smallCardValue}>143.699</ThemedText>
          </Card>
          
          <Card variant="primary" size="medium" style={styles.halfCard}>
            <ThemedText style={styles.smallCardLabel}>DAILY RATE</ThemedText>
            <ThemedText style={styles.smallCardValue}>33.699</ThemedText>
          </Card>
        </XStack> */}

        {/* Referral Link Section */}
        {/* <YStack style={styles.referralSection}>
          <ThemedText style={styles.sectionTitle}>YOUR REFERRAL LINK</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>
            Share your referral link with friends to earn more Points
          </ThemedText>
          <Card variant="dark" size="small" style={styles.referralCard}>
            <ThemedText style={styles.referralLink} numberOfLines={1} ellipsizeMode="middle">
              https://beta.contrax.finance/?re...
            </ThemedText>
            <TouchableOpacity style={styles.copyLinkButton}>
              <Ionicons name="copy-outline" size={16} color="#fff" />
            </TouchableOpacity>
          </Card>
        </YStack> */}

        {/* Token Balances */}
        {/* <YStack style={styles.section}>
          <ThemedText style={styles.sectionTitle}>TOKENS BALANCES</ThemedText>
          
          <TokenBalanceCard 
            symbol="USDC" 
            balance="4.258866" 
            value="$4.25" 
            iconColor="#2775CA"
          />
          
          <TokenBalanceCard 
            symbol="BERA" 
            balance="0.1" 
            value="$0.46" 
            iconColor="#FF5F52"
          />
          
          <TokenBalanceCard 
            symbol="INFRARED" 
            balance="0.00015840779" 
            value="$0.56" 
            iconColor="#FF5F52"
          />
          
          <TokenBalanceCard 
            symbol="POINTS" 
            balance="8 010" 
            iconColor="#72B21F"
            value="$0.00"
          />
        </YStack> */}

        {/* Stacked Tokens */}
        {/* <YStack style={styles.section}>
          <ThemedText style={styles.sectionTitle}>STACKED TOKENS</ThemedText>
          
          <Card variant="dark" size="medium" style={styles.stakingCard}>
            <XStack style={styles.stakingCardHeader}>
              <Ionicons name="cube" size={24} color="#FFC107" />
              <ThemedText style={styles.stakingCardTitle}>HONEY</ThemedText>
            </XStack>
            
            <XStack style={styles.stakingDetails}>
              <YStack style={styles.stakingDetail}>
                <ThemedText style={styles.stakingDetailLabel}>YOUR STAKE</ThemedText>
                <ThemedText style={styles.stakingDetailValue}>$0.99</ThemedText>
              </YStack>
              
              <YStack style={styles.stakingDetail}>
                <ThemedText style={styles.stakingDetailLabel}>APY</ThemedText>
                <ThemedText style={[styles.stakingDetailValue, styles.apyValue]}>84.3%</ThemedText>
              </YStack>
              
              <YStack style={styles.stakingDetail}>
                <ThemedText style={styles.stakingDetailLabel}>POINTS</ThemedText>
                <ThemedText style={styles.stakingDetailValue}>61/year</ThemedText>
              </YStack>
            </XStack>
          </Card>
        </YStack> */}

        {/* Last Transactions */}
        {/* <YStack style={[styles.section, styles.lastSection]}>
          <XStack style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>LAST TRANSACTIONS</ThemedText>
            <TouchableOpacity>
              <ThemedText style={styles.seeAllLink}>SEE ALL</ThemedText>
            </TouchableOpacity>
          </XStack>
          
          <TransactionCard 
            type="HONEY"
            time="A month ago"
            amount="0.56"
            detail="2 HONEY"
            action="Approve zap"
            showActionButtons={true}
          />
          
          <TransactionCard 
            type="APPROVE"
            time="A month ago"
            amount="0.56"
            detail="2 Honey"
            action="Approve zap"
            showActionButtons={true}
          />
          
          <TransactionCard 
            type="ZAP OUT"
            time="A month ago"
            detail="2 Honey"
            amount="1 USDC"
            action="Approve zap"
            showActionButtons={true}
          />
          
          <TransactionCard 
            type="BERA"
            time="A month ago"
            detail="2 BERA"
            amount="0.56"
            action="Approve zap"
            showActionButtons={true}
          />
        </YStack> */}
      </ScrollView>
    </ThemedView>
  )
}

// Token Balance Card Component
// const TokenBalanceCard = ({ symbol, balance, value, iconColor }: { symbol: string, balance: string, value: string, iconColor: string }) => {
//   return (
//     <Card variant="dark" size="small" style={styles.tokenCard}>
//       <XStack style={styles.tokenCardContent}>
//         <XStack style={styles.tokenInfo}>
//           <ThemedView style={[styles.tokenIcon, { backgroundColor: iconColor }]}>
//             {symbol === "USDC" && <Ionicons name="logo-usd" size={18} color="#fff" />}
//             {symbol === "BERA" && <Ionicons name="cube" size={18} color="#fff" />}
//             {symbol === "INFRARED" && <Ionicons name="cube" size={18} color="#fff" />}
//             {symbol === "POINTS" && <Ionicons name="leaf" size={18} color="#fff" />}
//           </ThemedView>
//           <YStack>
//             <ThemedText style={styles.tokenSymbol}>{symbol}</ThemedText>
//             <ThemedText style={styles.tokenBalance}>{balance}</ThemedText>
//           </YStack>
//         </XStack>
//         {value && <ThemedText style={styles.tokenValue}>{value}</ThemedText>}
//       </XStack>
//     </Card>
//   )
// }

// Transaction Card Component
// const TransactionCard = ({ type, time, amount, detail, action, showActionButtons = false }: { type: string, time: string, amount: string, detail: string, action: string, showActionButtons: boolean }) => {
//   const getIconByType = (type: string) => {
//     switch(type) {
//       case "HONEY": return <Ionicons name="cube" size={18} color="#FFC107" />;
//       case "BERA": return <Ionicons name="cube" size={18} color="#FF5F52" />;
//       case "APPROVE": return <Ionicons name="checkmark-circle" size={18} color="#72B21F" />;
//       case "ZAP OUT": return <Ionicons name="arrow-up-circle" size={18} color="#72B21F" />;
//       default: return <Ionicons name="cube" size={18} color="#72B21F" />;
//     }
//   }
  
//   return (
//     <Card variant="dark" size="small" style={styles.transactionCard}>
//       <XStack style={styles.transactionCardContent}>
//         <XStack style={styles.transactionInfo}>
//           {getIconByType(type)}
//           <YStack style={styles.transactionDetails}>
//             <ThemedText style={styles.transactionType}>{type}</ThemedText>
//             <ThemedText style={styles.transactionTime}>{time}</ThemedText>
//           </YStack>
//         </XStack>
        
//         <YStack style={styles.transactionValueSection}>
//           {amount && <ThemedText style={styles.transactionAmount}>{amount}</ThemedText>}
//           {detail && <ThemedText style={styles.transactionDetail}>{detail}</ThemedText>}
//           {action && <ThemedText style={styles.transactionAction}>{action}</ThemedText>}
          
//           {showActionButtons && (
//             <XStack style={styles.actionButtons}>
//               <TouchableOpacity style={[styles.actionButton, styles.approveButton]}>
//                 <ThemedText style={styles.actionButtonText}>Approve</ThemedText>
//               </TouchableOpacity>
//               <TouchableOpacity style={[styles.actionButton, styles.rejectButton]}>
//                 <ThemedText style={styles.actionButtonText}>Reject</ThemedText>
//               </TouchableOpacity>
//             </XStack>
//           )}
//         </YStack>
//       </XStack>
//     </Card>
//   )
// }

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
  },
  mainPointsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#151915', // Using bgSecondary from theme
    position: 'relative',
    minHeight: 120,
  },
  pointsLabel: {
    fontSize: 12,
    color: '#878B82', // Using textGrey from theme
    marginBottom: 8,
  },
  pointsValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  jarIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 40,
    height: 40,
    opacity: 0.6,
  },
  pointsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  halfCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    minHeight: 100,
  },
  smallCardLabel: {
    fontSize: 12,
    color: '#878B82', // Using textGrey from theme
    marginBottom: 8,
  },
  smallCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  referralSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#878B82', // Using textGrey from theme
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#878B82', // Using textGrey from theme
    marginBottom: 12,
  },
  referralCard: {
    backgroundColor: '#151915', // Using bgSecondary from theme
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  referralLink: {
    flex: 1,
    fontSize: 14,
    color: '#fff',
  },
  copyLinkButton: {
    padding: 4,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  tokenCard: {
    backgroundColor: '#151915', // Using bgSecondary from theme
    borderRadius: 8,
    marginBottom: 10,
    padding: 0,
  },
  tokenCardContent: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tokenInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenSymbol: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  tokenBalance: {
    fontSize: 12,
    color: '#878B82', // Using textGrey from theme
  },
  tokenValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  stakingCard: {
    backgroundColor: '#151915', // Using bgSecondary from theme
    borderRadius: 12,
    padding: 16,
  },
  stakingCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stakingCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  stakingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stakingDetail: {
    alignItems: 'flex-start',
  },
  stakingDetailLabel: {
    fontSize: 12,
    color: '#878B82', // Using textGrey from theme
    marginBottom: 4,
  },
  stakingDetailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  apyValue: {
    color: '#72B21F', // Using bgPrimary from theme
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllLink: {
    fontSize: 12,
    color: '#72B21F', // Using bgPrimary from theme
  },
  transactionCard: {
    backgroundColor: '#151915', // Using bgSecondary from theme
    borderRadius: 8,
    marginBottom: 10,
    padding: 0,
  },
  transactionCardContent: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  transactionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionDetails: {
    marginLeft: 12,
  },
  transactionType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  transactionTime: {
    fontSize: 12,
    color: '#878B82', // Using textGrey from theme
  },
  transactionValueSection: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  transactionDetail: {
    fontSize: 12,
    color: '#878B82', // Using textGrey from theme
  },
  transactionAction: {
    fontSize: 12,
    color: '#72B21F', // Using bgPrimary from theme
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  actionButton: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  approveButton: {
    backgroundColor: '#72B21F', // Using bgPrimary from theme
  },
  rejectButton: {
    backgroundColor: '#FF5F52', // Using statusCritical from theme
  },
  actionButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  lastSection: {
    marginBottom: 40, // Add extra padding at bottom for tab bar
  },
});
