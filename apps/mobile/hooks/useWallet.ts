import { useContext } from 'react';
import { WalletContext } from '../config/WalletProvider';

export const useWallet = () => {
  return useContext(WalletContext);
}; 