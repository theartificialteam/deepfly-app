import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  StatusBar,
} from 'react-native';
import {
  Text,
  Button,
  Surface,
  useTheme,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const FEATURES = [
  {
    icon: 'shield-check',
    title: 'On-Device Analysis',
    description: 'All processing happens locally on your device. Your media never leaves your phone.',
  },
  {
    icon: 'brain',
    title: '4-Model Ensemble',
    description: 'Uses multiple AI models for accurate deepfake detection with confidence scoring.',
  },
  {
    icon: 'image-multiple',
    title: 'Photos & Videos',
    description: 'Analyze both images and video files for potential deepfake manipulation.',
  },
  {
    icon: 'speedometer',
    title: 'Fast Results',
    description: 'Get comprehensive analysis results in seconds, not minutes.',
  },
  {
    icon: 'lock',
    title: 'Privacy First',
    description: 'Zero cloud uploads. Your personal media stays completely private.',
  },
  {
    icon: 'file-document',
    title: 'Detailed Reports',
    description: 'Generate and share detailed analysis reports with technical breakdown.',
  },
];

export default function HomeScreen({ navigation }) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <LinearGradient
          colors={['#FF6B6B20', '#0D0D0D']}
          style={styles.heroGradient}
        >
          <View style={styles.logoContainer}>
            <View style={styles.iconWrapper}>
              <MaterialCommunityIcons
                name="eye-check"
                size={48}
                color="#FF6B6B"
              />
            </View>
            <Text style={styles.appName}>DeepFly</Text>
            <Text style={styles.tagline}>AI-Powered Deepfake Detector</Text>
          </View>
          
          <Text style={styles.heroDescription}>
            Protect yourself from synthetic media manipulation. Our on-device AI 
            analyzes photos and videos to detect potential deepfakes with high accuracy.
          </Text>
        </LinearGradient>
      </View>

      {/* Features Section */}
      <ScrollView 
        style={styles.featuresScroll}
        contentContainerStyle={styles.featuresContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Features</Text>
        
        <View style={styles.featuresGrid}>
          {FEATURES.map((feature, index) => (
            <Surface key={index} style={styles.featureCard} elevation={2}>
              <View style={styles.featureIconContainer}>
                <MaterialCommunityIcons
                  name={feature.icon}
                  size={28}
                  color="#FF6B6B"
                />
              </View>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </Surface>
          ))}
        </View>

        {/* How It Works */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>How It Works</Text>
        
        <Surface style={styles.howItWorksCard} elevation={2}>
          <View style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Select Media</Text>
              <Text style={styles.stepDescription}>
                Choose a photo or video from your gallery, or take a new photo
              </Text>
            </View>
          </View>
          
          <View style={styles.stepDivider} />
          
          <View style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>AI Analysis</Text>
              <Text style={styles.stepDescription}>
                4 specialized models analyze facial features, symmetry & artifacts
              </Text>
            </View>
          </View>
          
          <View style={styles.stepDivider} />
          
          <View style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Get Results</Text>
              <Text style={styles.stepDescription}>
                View confidence scores and detailed breakdown from each model
              </Text>
            </View>
          </View>
        </Surface>

        {/* Spacer for button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* CTA Button */}
      <View style={styles.ctaContainer}>
        <LinearGradient
          colors={['transparent', '#0D0D0D']}
          style={styles.ctaGradient}
        >
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Upload')}
            style={styles.ctaButton}
            contentStyle={styles.ctaButtonContent}
            labelStyle={styles.ctaButtonLabel}
            icon="arrow-right"
          >
            Start Analysis
          </Button>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  heroSection: {
    paddingTop: StatusBar.currentHeight || 50,
  },
  heroGradient: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF6B6B15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FF6B6B40',
  },
  appName: {
    fontSize: 36,
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
  heroDescription: {
    fontSize: 15,
    color: '#A0A0A0',
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresScroll: {
    flex: 1,
  },
  featuresContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    marginLeft: 4,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: (width - 48) / 2,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#252525',
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FF6B6B15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 12,
    color: '#808080',
    lineHeight: 17,
  },
  howItWorksCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#252525',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 13,
    color: '#808080',
    lineHeight: 18,
  },
  stepDivider: {
    width: 2,
    height: 20,
    backgroundColor: '#FF6B6B40',
    marginLeft: 15,
    marginVertical: 8,
  },
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  ctaGradient: {
    paddingTop: 40,
    paddingBottom: 34,
    paddingHorizontal: 24,
  },
  ctaButton: {
    borderRadius: 16,
    backgroundColor: '#FF6B6B',
  },
  ctaButtonContent: {
    height: 56,
    flexDirection: 'row-reverse',
  },
  ctaButtonLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

