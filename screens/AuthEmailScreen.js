import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Text, Button, TextInput, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAppStore } from '../store/appStore';

export default function AuthEmailScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const setUser = useAppStore((state) => state.setUser);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Mock auth - no real backend
    const emailPrefix = email.split('@')[0];
    const userId = `user-${Date.now()}`;

    setUser({
      id: userId,
      name: emailPrefix,
      email: email.toLowerCase().trim(),
      isPro: false,
      isGuest: false,
    });

    setLoading(false);
    // Navigation happens automatically via App.js conditional rendering
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconWrapper}>
            <MaterialCommunityIcons
              name="account-circle"
              size={48}
              color="#FF6B6B"
            />
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Sign up to get 20 free analyses per day and sync your history across devices.
          </Text>
        </View>

        {/* Form */}
        <Surface style={styles.formCard} elevation={2}>
          <TextInput
            mode="outlined"
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
            outlineColor="#404040"
            activeOutlineColor="#FF6B6B"
            textColor="#FFFFFF"
            left={<TextInput.Icon icon="email" color="#808080" />}
          />

          <TextInput
            mode="outlined"
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={styles.input}
            outlineColor="#404040"
            activeOutlineColor="#FF6B6B"
            textColor="#FFFFFF"
            left={<TextInput.Icon icon="lock" color="#808080" />}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                color="#808080"
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />

          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.submitButton}
            contentStyle={styles.submitButtonContent}
            labelStyle={styles.submitButtonLabel}
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account / Log In'}
          </Button>
        </Surface>

        {/* Benefits */}
        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>Free Account Benefits</Text>
          
          {[
            { icon: 'chart-line', text: '20 analyses per day' },
            { icon: 'history', text: 'Analysis history saved' },
            { icon: 'cloud-sync', text: 'Sync across devices (coming soon)' },
          ].map((benefit, index) => (
            <View key={index} style={styles.benefitRow}>
              <MaterialCommunityIcons
                name={benefit.icon}
                size={18}
                color="#10B981"
              />
              <Text style={styles.benefitText}>{benefit.text}</Text>
            </View>
          ))}
        </View>

        {/* Back button */}
        <Button
          mode="text"
          onPress={() => navigation.goBack()}
          textColor="#808080"
          style={styles.backButton}
        >
          ← Back to options
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF6B6B15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#A0A0A0',
    textAlign: 'center',
    lineHeight: 20,
  },
  formCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#252525',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#0D0D0D',
  },
  submitButton: {
    borderRadius: 12,
    backgroundColor: '#FF6B6B',
    marginTop: 8,
  },
  submitButtonContent: {
    height: 52,
  },
  submitButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  benefitsContainer: {
    marginBottom: 24,
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 13,
    color: '#A0A0A0',
    marginLeft: 8,
  },
  backButton: {
    marginTop: 8,
  },
});

