import React from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Text, Button, Surface } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAppStore } from '../store/appStore';

const { width } = Dimensions.get('window');

export default function AuthLandingScreen({ navigation }) {
  const setUser = useAppStore((state) => state.setUser);

  const handleGuestContinue = () => {
    setUser({
      id: 'guest',
      name: 'Guest',
      email: null,
      isPro: false,
      isGuest: true,
    });
    // Navigation will happen automatically via App.js conditional rendering
  };

  const handleSignUp = () => {
    navigation.navigate('AuthEmail');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={['#FF6B6B20', '#0D0D0D', '#0D0D0D']}
        style={styles.gradient}
      >
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.iconWrapper}>
            <MaterialCommunityIcons
              name="eye-check"
              size={64}
              color="#FF6B6B"
            />
          </View>
          <Text style={styles.appName}>DeepFly</Text>
          <Text style={styles.tagline}>AI-Powered Deepfake Detector</Text>
        </View>

        {/* Description */}
        <Text style={styles.description}>
          Protect yourself from synthetic media manipulation. Analyze photos and 
          videos with on-device AI for complete privacy.
        </Text>

        {/* Features Preview */}
        <View style={styles.featuresContainer}>
          {[
            { icon: 'shield-check', text: 'On-device analysis' },
            { icon: 'brain', text: '4-model AI ensemble' },
            { icon: 'lock', text: '100% private' },
          ].map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <MaterialCommunityIcons
                name={feature.icon}
                size={20}
                color="#FF6B6B"
              />
              <Text style={styles.featureText}>{feature.text}</Text>
            </View>
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <Button
            mode="contained"
            onPress={handleSignUp}
            style={styles.primaryButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            icon="account-plus"
          >
            Sign Up / Log In
          </Button>

          <Button
            mode="outlined"
            onPress={handleGuestContinue}
            style={styles.secondaryButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.secondaryButtonLabel}
            textColor="#A0A0A0"
          >
            Continue as Guest
          </Button>

          <Text style={styles.guestNote}>
            Guest: 5 free analyses per day
          </Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          By continuing, you agree to our Terms of Service
        </Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FF6B6B15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FF6B6B40',
  },
  appName: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 14,
    color: '#FF6B6B',
    marginTop: 4,
    letterSpacing: 1,
  },
  description: {
    fontSize: 15,
    color: '#A0A0A0',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  featuresContainer: {
    marginBottom: 40,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 10,
  },
  buttonsContainer: {
    marginBottom: 24,
  },
  primaryButton: {
    borderRadius: 16,
    backgroundColor: '#FF6B6B',
    marginBottom: 12,
  },
  secondaryButton: {
    borderRadius: 16,
    borderColor: '#404040',
    marginBottom: 12,
  },
  buttonContent: {
    height: 56,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButtonLabel: {
    fontSize: 16,
  },
  guestNote: {
    fontSize: 12,
    color: '#606060',
    textAlign: 'center',
  },
  footer: {
    fontSize: 11,
    color: '#404040',
    textAlign: 'center',
  },
});

