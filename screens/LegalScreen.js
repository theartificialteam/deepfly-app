import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Text, Button, Surface, Checkbox } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { saveLegalAgreement } from '../services/storage';

const { height } = Dimensions.get('window');

const PRIVACY_HIGHLIGHTS = [
  'All analysis happens on your device - your photos never leave your phone',
  'We do not collect, store, or share your personal media',
  'Account data is stored securely and encrypted',
  'You can delete all your data at any time',
];

const TERMS_HIGHLIGHTS = [
  'Analysis results are for informational purposes only',
  'Results may not be 100% accurate (false positives/negatives possible)',
  'Do not use results as legal evidence or for accusations',
  'Free tier: 5-20 analyses/day, Pro: unlimited',
];

const DISCLAIMER_HIGHLIGHTS = [
  'DeepFly uses AI heuristics, not perfect detection',
  'Always verify important findings through other means',
  'Consult professionals for legal or serious matters',
  'Technology evolves - detection may have limitations',
];

export default function LegalScreen({ onAgree }) {
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToDisclaimer, setAgreedToDisclaimer] = useState(false);
  const [loading, setLoading] = useState(false);

  const canContinue = agreedToPrivacy && agreedToTerms && agreedToDisclaimer;

  const handleAgree = async () => {
    if (!canContinue) return;
    
    setLoading(true);
    try {
      await saveLegalAgreement(true);
      onAgree?.();
    } catch (error) {
      console.error('Error saving agreement:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderSection = (title, icon, highlights, checked, onCheck) => (
    <Surface style={styles.section} elevation={2}>
      <View style={styles.sectionHeader}>
        <MaterialCommunityIcons name={icon} size={24} color="#FF6B6B" />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      
      <View style={styles.highlightsList}>
        {highlights.map((item, index) => (
          <View key={index} style={styles.highlightRow}>
            <MaterialCommunityIcons
              name="check-circle"
              size={16}
              color="#10B981"
            />
            <Text style={styles.highlightText}>{item}</Text>
          </View>
        ))}
      </View>
      
      <View style={styles.checkboxRow}>
        <Checkbox
          status={checked ? 'checked' : 'unchecked'}
          onPress={onCheck}
          color="#FF6B6B"
        />
        <Text style={styles.checkboxText} onPress={onCheck}>
          I have read and agree to the {title}
        </Text>
      </View>
    </Surface>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={['#FF6B6B15', '#0D0D0D']}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconWrapper}>
              <MaterialCommunityIcons
                name="shield-check"
                size={48}
                color="#FF6B6B"
              />
            </View>
            <Text style={styles.title}>Before You Start</Text>
            <Text style={styles.subtitle}>
              Please review and accept our policies to continue
            </Text>
          </View>

          {/* Privacy Policy */}
          {renderSection(
            'Privacy Policy',
            'lock',
            PRIVACY_HIGHLIGHTS,
            agreedToPrivacy,
            () => setAgreedToPrivacy(!agreedToPrivacy)
          )}

          {/* Terms of Service */}
          {renderSection(
            'Terms of Service',
            'file-document',
            TERMS_HIGHLIGHTS,
            agreedToTerms,
            () => setAgreedToTerms(!agreedToTerms)
          )}

          {/* Disclaimer */}
          {renderSection(
            'Disclaimer',
            'alert-circle',
            DISCLAIMER_HIGHLIGHTS,
            agreedToDisclaimer,
            () => setAgreedToDisclaimer(!agreedToDisclaimer)
          )}

          {/* Continue Button */}
          <Button
            mode="contained"
            onPress={handleAgree}
            style={[
              styles.continueButton,
              !canContinue && styles.continueButtonDisabled,
            ]}
            contentStyle={styles.continueButtonContent}
            labelStyle={styles.continueButtonLabel}
            disabled={!canContinue}
            loading={loading}
          >
            {canContinue ? 'Continue to DeepFly' : 'Please accept all terms'}
          </Button>

          <Text style={styles.footerNote}>
            You can review these documents anytime in the app settings.
          </Text>

          <View style={{ height: 40 }} />
        </ScrollView>
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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: StatusBar.currentHeight + 40 || 80,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
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
  },
  section: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#252525',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 10,
  },
  highlightsList: {
    marginBottom: 12,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingRight: 8,
  },
  highlightText: {
    fontSize: 13,
    color: '#A0A0A0',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#25252580',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginTop: 4,
  },
  checkboxText: {
    fontSize: 13,
    color: '#FFFFFF',
    flex: 1,
  },
  continueButton: {
    borderRadius: 16,
    backgroundColor: '#FF6B6B',
    marginTop: 8,
  },
  continueButtonDisabled: {
    backgroundColor: '#404040',
  },
  continueButtonContent: {
    height: 56,
  },
  continueButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerNote: {
    fontSize: 12,
    color: '#606060',
    textAlign: 'center',
    marginTop: 16,
  },
});

