import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider, MD3DarkTheme } from 'react-native-paper';
import { Platform } from 'react-native';

import HomeScreen from './screens/HomeScreen';
import UploadScreen from './screens/UploadScreen';
import AnalysisScreen from './screens/AnalysisScreen';
import ResultsScreen from './screens/ResultsScreen';

const Stack = createNativeStackNavigator();

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

export default function App() {
  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer theme={navTheme}>
        <StatusBar style="light" />
        <Stack.Navigator
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
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Upload"
            component={UploadScreen}
            options={{
              title: 'Select Media',
            }}
          />
          <Stack.Screen
            name="Analysis"
            component={AnalysisScreen}
            options={{
              headerShown: false,
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="Results"
            component={ResultsScreen}
            options={{
              title: 'Analysis Results',
              headerBackVisible: false,
              gestureEnabled: false,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
