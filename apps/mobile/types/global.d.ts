import { ReactNode } from 'react';
import 'react-native';

declare module 'react-native' {
  export interface ViewProps {
    children?: ReactNode;
  }
}

declare global {
  namespace JSX {
    interface IntrinsicAttributes {
      children?: ReactNode;
    }
  }
} 