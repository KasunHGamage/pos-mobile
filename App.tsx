import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Navigation from './src/navigation';
import { CurrencyProvider } from './src/context/CurrencyContext';
import { AuthProvider } from './src/context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <SafeAreaProvider>
          <Navigation />
        </SafeAreaProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}
