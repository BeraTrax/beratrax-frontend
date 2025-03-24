import { useState } from 'react';
import { MdOutlineContentCopy } from 'react-icons/md';
import { Platform } from 'react-native';
import { Button, GetProps, Image, Text, XStack, YStack } from 'tamagui';

export type StakingCardProps = {
  // Connection props
  isConnected: boolean
  onConnect?: () => void
  onDisconnect?: () => void

  // Wallet info
  walletAddress?: string
  ensName?: string
  referralCode?: string

  // Staking info
  totalStaked?: number

  // Optional callbacks
  onCopyAddress?: () => void
  onExportKey?: () => void
  onExportQR?: () => void

  // Images
  stakingLogoSrc?: string
  walletLogoSrc?: string
}

export const StakingCard = ({
  isConnected,
  onConnect,
  onDisconnect,
  walletAddress,
  ensName,
  referralCode,
  totalStaked = 0,
  onCopyAddress,
  onExportKey,
  onExportQR,
  stakingLogoSrc,
  walletLogoSrc
}: StakingCardProps) => {
  const [showCopyFeedback, setShowCopyFeedback] = useState(false)
  const isSocial = true;

  const handleCopy = () => {
    if (onCopyAddress) {
      onCopyAddress()
      setShowCopyFeedback(true)
      setTimeout(() => setShowCopyFeedback(false), 1000)
    }
  }

  const truncateAddress = (address?: string) => {
    if (!address) return ''
    return `${address.slice(0, 5)}...${address.slice(-4)}`
  }

  return (
    <YStack
      backgroundColor="$backgroundDark"
      borderRadius={Platform.OS === 'web' ? 40 : 20}
      borderBottomWidth={1}
      borderBottomColor="$borderDark"
      overflow="hidden"
      position="relative"
    >
      {/* Not connected state */}
      {!isConnected ? (
        <XStack justifyContent="flex-end" padding={16}>
          <Button
            backgroundColor="$backgroundPrimary"
            color="$textLight"
            fontWeight="500"
            borderRadius={12}
            paddingHorizontal={16}
            paddingVertical={8}
            onPress={onConnect}
          >
            Sign In/Up
          </Button>
        </XStack>
      ) : (
        // Connected state
        <YStack padding={20}>
          {/* Wallet Address Section */}
          <XStack justifyContent="space-between" alignItems="center" paddingVertical={16}>
            <XStack alignItems="center" gap={8}>
              {walletLogoSrc && Platform.OS === 'web' && (
                <Image source={{ uri: walletLogoSrc }} width={32} height={32} />
              )}

              <YStack>
                <XStack alignItems="center" gap={8}>
                  <Text
                    fontFamily="$mono"
                    fontSize={16}
                    color="$textLight"
                    fontWeight="300"
                  >
                    {truncateAddress(walletAddress)}
                  </Text>

                  {/* Copy Button */}
                  <Button
                    unstyled
                    onPress={handleCopy}
                    marginLeft={8}
                    position="relative"
                  >
                    {Platform.OS === 'web' ? (
                      <MdOutlineContentCopy
                        size={16}
                        cursor={"pointer"}
                        color="$textLight"
                      />
                    ) : (
                      <Text fontSize={20}
                        cursor={"pointer"}
                        color="$textLight">📋</Text>
                    )}

                    {/* Copy Feedback */}
                    {showCopyFeedback && (
                      <YStack
                        position="absolute"
                        bottom={-40}
                        left={Platform.OS === 'web' ? -40 : -60}
                        backgroundColor="$backgroundPrimary"
                        paddingHorizontal={8}
                        paddingVertical={4}
                        borderRadius={8}
                        zIndex={10}
                      >
                        <Text color="$textLight" fontSize={12}>
                          Address copied!
                        </Text>
                      </YStack>
                    )}
                  </Button>
                </XStack>

                {/* ENS Name or Referral Code */}
                {(ensName || referralCode) && (
                  <Text
                    fontSize={16}
                    fontWeight="700"
                    color="$yellow10"
                    marginTop={4}
                  >
                    {ensName || referralCode}
                  </Text>
                )}
              </YStack>
            </XStack>

            {/* Disconnect Button */}
            <Button
              unstyled
              onPress={onDisconnect}
              paddingHorizontal={8}
            >
              <Text fontSize={Platform.OS === 'web' ? 24 : 22} color="$textLight">⏻</Text>
            </Button>
          </XStack>

          {/* Social Wallet Actions */}
          <XStack gap={16} marginTop={16} justifyContent="flex-start">
            {/* Export Private Key */}
            <Button
              backgroundColor="$backgroundPrimary"
              paddingHorizontal={16}
              paddingVertical={10}
              borderRadius={12}
              onPress={onExportKey}
            >
              <Text fontSize={16} color="$textLight">🔑</Text>
            </Button>

            {/* Export QR Code */}
            <Button
              backgroundColor="$backgroundPrimary"
              paddingHorizontal={16}
              paddingVertical={10}
              borderRadius={12}
              onPress={onExportQR}
            >
              <Text fontSize={16} color="$textLight">📱</Text>
            </Button>
          </XStack>

          {/* Staking Section */}
          <YStack marginTop={Platform.OS === 'web' ? 80 : 40} position="relative">
            {/* Background gradient effect */}
            <YStack
              position="absolute"
              width={Platform.OS === 'web' ? 416 : 300}
              height={Platform.OS === 'web' ? 416 : 300}
              borderRadius={200}
              right={Platform.OS === 'web' ? -128 : -100}
              bottom={Platform.OS === 'web' ? -160 : -120}
              opacity={0.5}
              backgroundColor="$backgroundPrimary"
            />

            <Text
              fontFamily="$mono"
              fontSize={18}
              color="$textLight"
              textTransform="uppercase"
            >
              TOTAL STAKED
            </Text>

            <Text
              fontFamily="$heading"
              fontSize={34}
              fontWeight="700"
              color="$textLight"
            >
              ${totalStaked.toFixed(2)}
            </Text>

            {/* Staking Logo */}
            {stakingLogoSrc && Platform.OS === 'web' && (
              <Image
                position="absolute"
                width={Platform.OS === 'web' ? 288 : 200}
                height={Platform.OS === 'web' ? 120 : 100}
                right={Platform.OS === 'web' ? 12 : 8}
                bottom={Platform.OS === 'web' ? -64 : -40}
                source={{ uri: stakingLogoSrc }}
                resizeMode="contain"
              />
            )}
          </YStack>
        </YStack>
      )}
    </YStack>
  )
}

export type StakingCardComponentProps = GetProps<typeof StakingCard> 