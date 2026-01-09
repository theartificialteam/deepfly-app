import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider, MD3DarkTheme } from 'react-native-paper';
import { Platform } from 'react-native';

import { useAppStore } from './store/appStore';

// Auth Screens
import AuthLandingScreen from './screens/AuthLandingScreen';
import AuthEmailScreen from './screens/AuthEmailScreen';

// Main App Screens
import HomeScreen from './screens/HomeScreen';
import UploadScreen from './screens/UploadScreen';
import AnalysisScreen from './screens/AnalysisScreen';
import ResultsScreen from './screens/ResultsScreen';

const AuthStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();

// Custom dark theme with red/pink accents
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

// Navigation theme with required fonts for React Navigation v7
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
      regular: {
        fontFamily: 'System',
        fontWeight: '400',
      },
      medium: {
        fontFamily: 'System',
        fontWeight: '500',
      },
      bold: {
        fontFamily: 'System',
        fontWeight: '700',
      },
      heavy: {
        fontFamily: 'System',
        fontWeight: '800',
      },
    },
    default: {
      regular: {
        fontFamily: 'sans-serif',
        fontWeight: 'normal',
      },
      medium: {
        fontFamily: 'sans-serif-medium',
        fontWeight: 'normal',
      },
      bold: {
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
      },
      heavy: {
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
      },
    },
  }),
};

// Auth Navigator (shown when user is not logged in)
function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: '#0D0D0D',
        },
      }}
    >
      <AuthStack.Screen name="AuthLanding" component={AuthLandingScreen} />
      <AuthStack.Screen name="AuthEmail" component={AuthEmailScreen} />
    </AuthStack.Navigator>
  );
}

// Main App Navigator (shown when user is logged in or guest)
function MainNavigator() {
  return (
    <MainStack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1A1A1A',
        },
        headerTintColor: '#FFFFFF',
        contentStyle: {
          backgroundColor: '#0D0D0D',
        },
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
        options={{
          title: 'Select Media',
        }}
      />
      <MainStack.Screen
        name="Analysis"
        component={AnalysisScreen}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <MainStack.Screen
        name="Results"
        component={ResultsScreen}
        options={{
          title: 'Analysis Results',
          headerBackVisible: false,
          gestureEnabled: false,
        }}
      />
      {/* AuthEmail accessible from MainStack for guest upgrade */}
      <MainStack.Screen
        name="AuthEmail"
        component={AuthEmailScreen}
        options={{
          title: 'Create Account',
          presentation: 'modal',
        }}
      />
    </MainStack.Navigator>
  );
}

// Root App Component
function RootNavigator() {
  const user = useAppStore((state) => state.user);
  
  return user ? <MainNavigator /> : <AuthNavigator />;
}

export default function App() {
  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer theme={navTheme}>
        <StatusBar style="light" />
        <RootNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
}
