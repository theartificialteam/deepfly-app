/**
 * DeepFly - AI-Powered Deepfake Detector
 * 
 * Main application entry point.
 * Handles navigation, theme, initialization, and auth flow.
 */

import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider, MD3DarkTheme } from 'react-native-paper';
import { Platform, View, Text, StyleSheet, ActivityIndicator } from 'react-native';

import { useAppStore } from './store/appStore';
import {
  loadUser,
  loadHistory,
  loadUsageToday,
  loadLastResetDate,
  hasAgreedToLegal,
  getTodayDateString,
} from './services/storage';
import { initializeIAP, checkProStatus } from './services/iapService';

// Screens
import LegalScreen from './screens/LegalScreen';
import AuthLandingScreen from './screens/AuthLandingScreen';
import AuthEmailScreen from './screens/AuthEmailScreen';
import HomeScreen from './screens/HomeScreen';
import UploadScreen from './screens/UploadScreen';
import AnalysisScreen from './screens/AnalysisScreen';
import ResultsScreen from './screens/ResultsScreen';
import UserProfileScreen from './screens/UserProfileScreen';

const AuthStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();

// Custom dark theme
const paperTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#FF6B6B',
    primaryContainer: '#FF6B6B20',
    secondary: '#10B981',
    secondaryContainer: '#10B98120',
    background: '#0D0D0D',
    surface: '#1A1A1A',
    surfaceVariant: '#252525',
    error: '#FF6B6B',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: '#FFFFFF',
    onSurface: '#FFFFFF',
    onSurfaceVariant: '#A0A0A0',
    outline: '#404040',
  },
  roundness: 16,
};

// Navigation theme
const navTheme = {
  dark: true,
  colors: {
    primary: '#FF6B6B',
    background: '#0D0D0D',
    card: '#1A1A1A',
    text: '#FFFFFF',
    border: '#404040',
    notification: '#FF6B6B',
  },
  fonts: Platform.select({
    ios: {
      regular: { fontFamily: 'System', fontWeight: '400' },
      medium: { fontFamily: 'System', fontWeight: '500' },
      bold: { fontFamily: 'System', fontWeight: '700' },
      heavy: { fontFamily: 'System', fontWeight: '800' },
    },
    default: {
      regular: { fontFamily: 'sans-serif', fontWeight: 'normal' },
      medium: { fontFamily: 'sans-serif-medium', fontWeight: 'normal' },
      bold: { fontFamily: 'sans-serif', fontWeight: 'bold' },
      heavy: { fontFamily: 'sans-serif', fontWeight: 'bold' },
    },
  }),
};

// Loading Screen Component
function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#FF6B6B" />
      <Text style={styles.loadingText}>Loading DeepFly...</Text>
    </View>
  );
}

// Auth Navigator
function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0D0D0D' },
      }}
    >
      <AuthStack.Screen name="AuthLanding" component={AuthLandingScreen} />
      <AuthStack.Screen name="AuthEmail" component={AuthEmailScreen} />
    </AuthStack.Navigator>
  );
}

// Main App Navigator
function MainNavigator() {
  return (
    <MainStack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: { backgroundColor: '#1A1A1A' },
        headerTintColor: '#FFFFFF',
        contentStyle: { backgroundColor: '#0D0D0D' },
      }}
    >
      <MainStack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <MainStack.Screen
        name="Upload"
        component={UploadScreen}
        options={{ title: 'Select Media' }}
      />
      <MainStack.Screen
        name="Analysis"
        component={AnalysisScreen}
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <MainStack.Screen
        name="Results"
        component={ResultsScreen}
        options={{ title: 'Analysis Results', headerShown: false }}
      />
      <MainStack.Screen
        name="AuthEmail"
        component={AuthEmailScreen}
        options={{ title: 'Create Account', presentation: 'modal' }}
      />
      <MainStack.Screen
        name="UserProfile"
        component={UserProfileScreen}
        options={{ title: 'User Profile' }}
      />
    </MainStack.Navigator>
  );
}

// Root Navigator
function RootNavigator() {
  const user = useAppStore((state) => state.user);
  return user ? <MainNavigator /> : <AuthNavigator />;
}

// Main App Component
export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showLegal, setShowLegal] = useState(false);
  
  const setUser = useAppStore((state) => state.setUser);
  const setHistory = useAppStore((state) => state.setHistory);
  const setUsageToday = useAppStore((state) => state.setUsageToday);
  const setLastResetDate = useAppStore((state) => state.setLastResetDate);
  const resetDailyUsage = useAppStore((state) => state.resetDailyUsage);
  const setInitialized = useAppStore((state) => state.setInitialized);
  const setHasAgreedToLegal = useAppStore((state) => state.setHasAgreedToLegal);
  const updateUserPro = useAppStore((state) => state.updateUserPro);

  useEffect(() => {
    initializeApp();
  }, []);

  async function initializeApp() {
    try {
      console.log('[App] Initializing...');
      
      // 1. Check legal agreement
      const agreed = await hasAgreedToLegal();
      setHasAgreedToLegal(agreed);
      if (!agreed) {
        setShowLegal(true);
        setIsLoading(false);
        return;
      }
      
      // 2. Load user data
      const savedUser = await loadUser();
      if (savedUser) {
        await setUser(savedUser);
        console.log('[App] User restored:', savedUser.email || savedUser.name);
      }
      
      // 3. Load history
      const savedHistory = await loadHistory();
      if (savedHistory && savedHistory.length > 0) {
        setHistory(savedHistory);
        console.log('[App] History restored:', savedHistory.length, 'items');
      }
      
      // 4. Load usage data and check for daily reset
      const lastReset = await loadLastResetDate();
      const today = getTodayDateString();
      
      if (lastReset !== today) {
        // New day - reset usage
        console.log('[App] New day detected, resetting usage');
        await resetDailyUsage();
      } else {
        // Same day - restore usage
        const savedUsage = await loadUsageToday();
        setUsageToday(savedUsage);
        setLastResetDate(lastReset);
        console.log('[App] Usage restored:', savedUsage);
      }
      
      // 5. Initialize IAP (non-blocking)
      initializeIAP().then(async () => {
        // Check Pro status
        const proStatus = await checkProStatus();
        if (proStatus.isPro) {
          await updateUserPro(true);
        }
      }).catch(console.warn);
      
      setInitialized(true);
      console.log('[App] Initialization complete');
      
    } catch (error) {
      console.error('[App] Initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleLegalAgree = () => {
    setShowLegal(false);
    setHasAgreedToLegal(true);
    // Re-run initialization after legal agreement
    setIsLoading(true);
    initializeApp();
  };

  if (isLoading) {
    return (
      <PaperProvider theme={paperTheme}>
        <LoadingScreen />
      </PaperProvider>
    );
  }

  if (showLegal) {
    return (
      <PaperProvider theme={paperTheme}>
        <StatusBar style="light" />
        <LegalScreen onAgree={handleLegalAgree} />
      </PaperProvider>
    );
  }

  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer theme={navTheme}>
        <StatusBar style="light" />
        <RootNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#A0A0A0',
    fontSize: 16,
    marginTop: 16,
  },
});
