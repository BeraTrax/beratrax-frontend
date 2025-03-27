import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { cn } from '.';

interface WalletAndStakingPointProps {
  address?: string;
  ensName?: string;
  referralCode?: string;
  isConnected?: boolean;
  isConnecting?: boolean;
  totalStaked?: number;
  stakedPoints?: number;
  onCopy?: () => void;
  onDisconnect?: () => void;
  onConnect?: () => void;
  onStake?: () => void;
}

export const WalletAndStakingPoint: React.FC<WalletAndStakingPointProps> = ({
  address = '0x0000000000000000000000000000000000000000',
  ensName = 'Bera',
  referralCode = 'Bera',
  isConnected = true,
  isConnecting = false,
  totalStaked = 100,
  stakedPoints = 418.256,
  onCopy,
  onDisconnect,
  onConnect,
  onStake
}) => {
  // Helper function to truncate address
  const truncateAddress = (addr: string) => {
    return addr ? `${addr.slice(0, 5)}...${addr.slice(-4)}` : '';
  };

  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <View 
      style={{ $$css: true, test: cn(
        "bg-bgDark rounded-2xl border border-borderDark relative overflow-hidden w-full",
        "pb-16" // Add padding at bottom
      )}}
    >
      {/* Green gradient overlay at bottom right */}
      <View 
        style={{ $$css: true, test: cn(
          "absolute w-40 h-40 rounded-full opacity-20",
          "bg-green-500 bottom-[-20px] right-[-20px]"
        )}}
      />
      <View 
        style={{ $$css: true, test: cn(
          "absolute w-60 h-60 rounded-full opacity-10",
          "bg-green-400 bottom-[-40px] right-[-40px]"
        )}}
      />
      
      <View style={{ $$css: true, test: "p-5" }}>
        {/* Wallet Address Section */}
        {isConnected ? (
          <View style={{ $$css: true, test: "flex flex-row items-center justify-between" }}>
            <View style={{ $$css: true, test: "flex flex-row items-center" }}>
              {/* Green dot indicator */}
              <View style={{ $$css: true, test: "w-5 h-5 mr-2 bg-green-500 rounded-full" }} />
              
              <Text style={{ $$css: true, test: "font-mono text-sm text-white" }}>
                {truncateAddress(address)}
              </Text>
            </View>
            
            <TouchableOpacity onPress={onCopy} style={{ $$css: true, test: "ml-2" }}>
              <Text style={{ $$css: true, test: "text-white text-xl" }}>📋</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ $$css: true, test: "flex flex-row justify-end" }}>
            <TouchableOpacity 
              onPress={onConnect}
              style={{ $$css: true, test: "bg-bgPrimary rounded-xl px-4 py-2" }}
            >
              <Text style={{ $$css: true, test: "text-white font-medium" }}>
                {isConnecting ? "Connecting..." : "Sign In/Up"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Staking Points Section */}
        {isConnected && (
          <View style={{ $$css: true, test: "mt-10" }}>
            {/* POINTS FROM STAKING label */}
            <Text style={{ $$css: true, test: "text-sm font-normal text-white uppercase tracking-wider" }}>
              POINTS FROM STAKING
            </Text>
            
            {/* Points value */}
            <View style={{ $$css: true, test: "flex flex-row justify-between items-center mt-2" }}>
              <Text style={{ $$css: true, test: "text-5xl font-bold text-white" }}>
                {stakedPoints.toLocaleString()}
              </Text>
              
              {/* Honey jar icon placeholder */}
              <View style={{ $$css: true, test: "relative" }}>
                {/* Decorative dots around jar */}
                <View style={{ $$css: true, test: "absolute w-2 h-2 bg-green-400 rounded-full top-0 left-0" }} />
                <View style={{ $$css: true, test: "absolute w-2 h-2 bg-green-400 rounded-full top-4 right-0" }} />
                <View style={{ $$css: true, test: "absolute w-2 h-2 bg-green-400 rounded-full bottom-0 left-4" }} />
                <View style={{ $$css: true, test: "absolute w-3 h-3 bg-green-400 rounded-full bottom-4 left-[-8px]" }} />
                
                {/* Honey jar icon (placeholder using View with border) */}
                <View style={{ $$css: true, test: "w-12 h-12 bg-transparent border-2 border-green-400 rounded-lg relative" }}>
                  {/* Jar lid */}
                  <View style={{ $$css: true, test: "w-14 h-2 bg-green-400 absolute -top-2 -left-1" }} />
                  {/* Honey symbol */}
                  <Text style={{ $$css: true, test: "text-center text-green-400 text-lg mt-1" }}>🐻</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};
