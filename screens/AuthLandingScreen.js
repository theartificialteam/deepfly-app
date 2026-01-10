import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Animated,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Text, Button, Surface } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAppStore } from '../store/appStore';

const { width, height } = Dimensions.get('window');

// Custom animated component factory
const createAnimatedComponent = (Component) => Animated.createAnimatedComponent(Component);
const AnimatedSurface = createAnimatedComponent(Surface);
const AnimatedButton = createAnimatedComponent(Button);
const AnimatedText = createAnimatedComponent(Text);

// Feature component
const Feature = ({ icon, title, description, style }) => (
  <AnimatedSurface style={[styles.featureCard, style]} elevation={3}>
    <MaterialCommunityIcons name={icon} size={28} color="#A78BFA" />
    <Text style={styles.featureTitle}>{title}</Text>
    <Text style={styles.featureDescription}>{description}</Text>
  </AnimatedSurface>
);

export default function AuthLandingScreen({ navigation }) {
  const setUser = useAppStore((state) => state.setUser);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
    
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 20,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleGuestContinue = () => {
    setUser({
      id: 'guest',
      name: 'Guest',
      email: null,
      isPro: false,
      isGuest: true,
    });
  };

  const handleSignUp = () => {
    navigation.navigate('AuthEmail');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={['#1A1A2E', '#0D0D0D']}
        style={styles.gradient}
      />

      <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
        {/* Header */}
        <Animated.View style={[styles.header, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons
              name="shield-check"
              size={40}
              color="#A78BFA"
            />
          </View>
          <Text style={styles.appName}>DeepFly</Text>
          <Text style={styles.tagline}>Your Personal Deepfake Detector</Text>
        </Animated.View>
        
        {/* Features */}
        <View style={styles.featuresGrid}>
          <Feature
            icon="lock-check"
            title="Total Privacy"
            description="All analysis happens on-device. Your media never leaves your phone."
            style={{ transform: [{ translateY: slideAnim }] }}
          />
          <Feature
            icon="rocket-launch"
            title="Instant Results"
            description="Our advanced AI provides a verdict in seconds, not minutes."
            style={{ transform: [{ translateY: slideAnim }] }}
          />
        </View>

        {/* Action Buttons */}
        <Animated.View style={[styles.buttonContainer, { transform: [{ translateY: slideAnim }] }]}>
          <Button
            mode="contained"
            onPress={handleSignUp}
            style={styles.primaryButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            icon="arrow-right-circle"
          >
            Get Started
          </Button>

          <Button
            mode="text"
            onPress={handleGuestContinue}
            style={styles.secondaryButton}
            labelStyle={styles.secondaryButtonLabel}
            textColor="#808080"
          >
            Continue as Guest
          </Button>
          <Text style={styles.guestNote}>5 free analyses per day</Text>
        </Animated.View>

        {/* Footer */}
        <AnimatedText style={[styles.footer, { opacity: fadeAnim }]}>
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </AnimatedText>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: height * 0.1,
    paddingBottom: height * 0.05,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(167, 139, 250, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.2)',
  },
  appName: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 16,
    color: '#A78BFA',
    marginTop: 4,
  },
  featuresGrid: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 20,
  },
  featureCard: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#252525',
    minHeight: 150,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 12,
    color: '#A0A0A0',
    textAlign: 'center',
    lineHeight: 18,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    borderRadius: 16,
    backgroundColor: '#A78BFA',
    width: '100%',
    marginBottom: 8,
  },
  buttonContent: {
    height: 56,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    marginTop: 8,
  },
  secondaryButtonLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  guestNote: {
    fontSize: 12,
    color: '#606060',
    marginTop: 4,
  },
  footer: {
    fontSize: 11,
    color: '#404040',
    textAlign: 'center',
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
  },
});





