import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Share,
  Alert,
  StatusBar,
  Dimensions,
} from 'react-native';
import {
  Text,
  Button,
  Surface,
  ProgressBar,
  Divider,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAppStore } from '../store/appStore';
import { logAnalysisResult } from '../services/firebaseService';

const { width } = Dimensions.get('window');

// Method details for UI display
const METHOD_INFO = {
  cnn: {
    name: 'CNN / Pattern Analysis',
    icon: 'brain',
    emoji: '🧠',
    description: 'Deep learning pattern recognition',
  },
  texture: {
    name: 'Texture Analysis',
    icon: 'magnify-scan',
    emoji: '🔍',
    description: 'Skin smoothness and GAN artifacts',
  },
  color: {
    name: 'Color Analysis',
    icon: 'palette',
    emoji: '🎨',
    description: 'Unnatural color patterns detection',
  },
  geometry: {
    name: 'Geometry Analysis',
    icon: 'vector-polygon',
    emoji: '📐',
    description: 'Face proportions and structure',
  },
  frequency: {
    name: 'Frequency Analysis',
    icon: 'waveform',
    emoji: '📊',
    description: 'FFT compression artifacts',
  },
  symmetry: {
    name: 'Symmetry Analysis',
    icon: 'scale-balance',
    emoji: '⚖️',
    description: 'Left-right face symmetry check',
  },
  blink: {
    name: 'Eye Blink Detection',
    icon: 'eye',
    emoji: '👁️',
    description: 'Natural blink pattern analysis',
  },
  pupil: {
    name: 'Pupil Dynamics',
    icon: 'eye-circle',
    emoji: '🔮',
    description: 'Pupil size variation tracking',
  },
};

export default function ResultsScreen({ navigation, route }) {
  const { result } = route.params;
  const [sharing, setSharing] = useState(false);
  
  const currentAnalysis = useAppStore((state) => state.currentAnalysis);

  const isProbablyDeepfake = result.isProbablyDeepfake;
  const confidence = result.confidence;
  const isVideo = result.fileType === 'video';
  
  // Get scores (support both old and new format)
  const scores = result.scores || {
    cnn: result.model1 || 50,
    texture: result.model2 || 50,
    color: 50,
    geometry: 50,
    frequency: result.model3 || 50,
    symmetry: result.model4 || 50,
    blink: 50,
    pupil: 50,
  };

  // Determine verdict color
  const verdictColor = isProbablyDeepfake ? '#FF6B6B' : '#10B981';
  const verdictBgColor = isProbablyDeepfake ? '#FF6B6B15' : '#10B98115';

  // Get score color
  const getScoreColor = (score) => {
    if (score >= 70) return '#FF6B6B';
    if (score >= 40) return '#F59E0B';
    return '#10B981';
  };

  // Generate detailed report
  const generateReport = () => {
    const timestamp = new Date(result.timestamp).toLocaleString();
    
    let report = `
═══════════════════════════════════════════════════════
                 DEEPFLY ANALYSIS REPORT
═══════════════════════════════════════════════════════

📅 Analysis Date: ${timestamp}
🔬 File Type: ${result.fileType || 'Unknown'}
⏱️ Processing Time: ${result.processingTime?.toFixed(2) || '?'} seconds
📷 Frames Analyzed: ${result.framesAnalyzed || 1}

───────────────────────────────────────────────────────
                      VERDICT
───────────────────────────────────────────────────────

${isProbablyDeepfake ? '⚠️ LIKELY DEEPFAKE' : '✅ LIKELY AUTHENTIC'}

🎯 Final Confidence Score: ${confidence}%

───────────────────────────────────────────────────────
                 DETAILED BREAKDOWN
───────────────────────────────────────────────────────

🧠 CNN/Pattern Analysis:    ${scores.cnn}%
🔍 Texture Analysis:        ${scores.texture}%
🎨 Color Analysis:          ${scores.color}%
📐 Geometry Analysis:       ${scores.geometry}%
📊 Frequency Analysis:      ${scores.frequency}%
⚖️ Symmetry Analysis:       ${scores.symmetry}%`;

    if (isVideo) {
      report += `
👁️ Eye Blink Detection:     ${scores.blink}%
🔮 Pupil Dynamics:          ${scores.pupil}%

📹 Video-Specific Info:
   • Blink Count: ${result.blinkCount || 0}
   • Pupil Variance: ${result.pupilVariance?.toFixed(1) || 0}%`;
    }

    if (result.indicators && result.indicators.length > 0) {
      report += `

───────────────────────────────────────────────────────
                   ⚠️ INDICATORS FOUND
───────────────────────────────────────────────────────

${result.indicators.map(ind => `• ${ind}`).join('\n')}`;
    }

    report += `

───────────────────────────────────────────────────────
                  TECHNICAL DETAILS
───────────────────────────────────────────────────────

👤 Faces Detected: ${result.faces || 0}
🔧 Methods Used: ${result.methodsUsed?.length || 6}

───────────────────────────────────────────────────────
                     DISCLAIMER
───────────────────────────────────────────────────────

This analysis is provided for informational purposes only.
Results are based on AI/ML algorithms and heuristics.
False positives and negatives are possible.

Generated by DeepFly - AI-Powered Deepfake Detector
All processing performed on-device for privacy.

═══════════════════════════════════════════════════════
`;

    return report.trim();
  };

  const shareReport = async () => {
    try {
      setSharing(true);
      const report = generateReport();
      
      await Share.share({
        message: report,
        title: 'DeepFly Analysis Report',
      });
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share report.');
    } finally {
      setSharing(false);
    }
  };

  const handleGoHome = () => {
    logAnalysisResult(result);
    navigation.popToTop();
  };

  // Methods to display
  const methodsToShow = isVideo
    ? ['cnn', 'texture', 'color', 'geometry', 'frequency', 'symmetry', 'blink', 'pupil']
    : ['cnn', 'texture', 'color', 'geometry', 'frequency', 'symmetry'];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatusBar barStyle="light-content" />

      {/* Verdict Card */}
      <Surface
        style={[styles.verdictCard, { backgroundColor: verdictBgColor }]}
        elevation={3}
      >
        <View style={styles.verdictIconContainer}>
          <MaterialCommunityIcons
            name={isProbablyDeepfake ? 'alert-circle' : 'check-circle'}
            size={64}
            color={verdictColor}
          />
        </View>
        
        <Text style={[styles.verdictText, { color: verdictColor }]}>
          {isProbablyDeepfake ? '⚠️ Likely Deepfake' : '✅ Likely Authentic'}
        </Text>
        
        <Text style={styles.confidenceLabel}>Confidence Score</Text>
        
        <Text style={[styles.confidenceValue, { color: verdictColor }]}>
          {confidence}%
        </Text>
        
        <View style={styles.confidenceBarContainer}>
          <ProgressBar
            progress={confidence / 100}
            color={verdictColor}
            style={styles.confidenceBar}
          />
        </View>
        
        <Text style={styles.verdictSubtext}>
          {isProbablyDeepfake
            ? 'This media shows signs of potential manipulation or synthetic generation.'
            : 'This media appears to be authentic with no significant manipulation detected.'}
        </Text>
      </Surface>

      {/* Indicators (if any) */}
      {result.indicators && result.indicators.length > 0 && (
        <Surface style={styles.indicatorsCard} elevation={2}>
          <Text style={styles.indicatorsTitle}>⚠️ Suspicious Indicators Found</Text>
          {result.indicators.map((indicator, idx) => (
            <View key={idx} style={styles.indicatorRow}>
              <MaterialCommunityIcons name="alert" size={16} color="#FF6B6B" />
              <Text style={styles.indicatorText}>{indicator}</Text>
            </View>
          ))}
        </Surface>
      )}

      {/* Detection Methods Breakdown */}
      <Text style={styles.sectionTitle}>🔬 Detection Methods</Text>
      
      {methodsToShow.map((key) => {
        const info = METHOD_INFO[key];
        const score = scores[key] || 50;
        const color = getScoreColor(score);
        
        return (
          <Surface key={key} style={styles.methodCard} elevation={2}>
            <View style={styles.methodHeader}>
              <View style={[styles.methodIconContainer, { backgroundColor: color + '15' }]}>
                <Text style={styles.methodEmoji}>{info.emoji}</Text>
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodName}>{info.name}</Text>
                <Text style={styles.methodDescription}>{info.description}</Text>
              </View>
              <View style={styles.scoreContainer}>
                <Text style={[styles.methodScore, { color }]}>{score}%</Text>
                <Text style={[styles.scoreLabel, { color }]}>
                  {score >= 70 ? 'High' : score >= 40 ? 'Medium' : 'Low'}
                </Text>
              </View>
            </View>
            <ProgressBar
              progress={score / 100}
              color={color}
              style={styles.methodProgressBar}
            />
          </Surface>
        );
      })}

      {/* Video-specific stats */}
      {isVideo && (
        <Surface style={styles.videoStatsCard} elevation={2}>
          <Text style={styles.videoStatsTitle}>📹 Video Analysis Stats</Text>
          <View style={styles.videoStatsRow}>
            <View style={styles.videoStat}>
              <Text style={styles.videoStatValue}>{result.framesAnalyzed || 1}</Text>
              <Text style={styles.videoStatLabel}>Frames</Text>
            </View>
            <View style={styles.videoStat}>
              <Text style={styles.videoStatValue}>{result.blinkCount || 0}</Text>
              <Text style={styles.videoStatLabel}>Blinks</Text>
            </View>
            <View style={styles.videoStat}>
              <Text style={styles.videoStatValue}>{result.pupilVariance?.toFixed(1) || '0'}%</Text>
              <Text style={styles.videoStatLabel}>Pupil Var</Text>
            </View>
          </View>
        </Surface>
      )}

      {/* Technical Details */}
      <Text style={styles.sectionTitle}>📋 Technical Details</Text>
      
      <Surface style={styles.detailsCard} elevation={2}>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="account-group" size={20} color="#808080" />
          <Text style={styles.detailLabel}>Faces Detected</Text>
          <Text style={styles.detailValue}>{result.faces || 0}</Text>
        </View>
        
        <Divider style={styles.detailDivider} />
        
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="timer" size={20} color="#808080" />
          <Text style={styles.detailLabel}>Processing Time</Text>
          <Text style={styles.detailValue}>{result.processingTime?.toFixed(2) || '?'}s</Text>
        </View>
        
        <Divider style={styles.detailDivider} />
        
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="chip" size={20} color="#808080" />
          <Text style={styles.detailLabel}>Methods Used</Text>
          <Text style={styles.detailValue}>{methodsToShow.length} methods</Text>
        </View>
        
        <Divider style={styles.detailDivider} />
        
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="file-document" size={20} color="#808080" />
          <Text style={styles.detailLabel}>File Type</Text>
          <Text style={styles.detailValue}>{result.fileType || 'Unknown'}</Text>
        </View>
        
        <Divider style={styles.detailDivider} />
        
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="calendar" size={20} color="#808080" />
          <Text style={styles.detailLabel}>Analyzed</Text>
          <Text style={styles.detailValue}>
            {new Date(result.timestamp).toLocaleDateString()}
          </Text>
        </View>
      </Surface>

      {/* Score Interpretation */}
      <Surface style={styles.interpretationCard} elevation={1}>
        <Text style={styles.interpretationTitle}>📊 Score Interpretation</Text>
        <View style={styles.interpretationRow}>
          <View style={[styles.interpretationDot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.interpretationText}>0-40%: Likely authentic (Low risk)</Text>
        </View>
        <View style={styles.interpretationRow}>
          <View style={[styles.interpretationDot, { backgroundColor: '#F59E0B' }]} />
          <Text style={styles.interpretationText}>40-70%: Inconclusive (Medium risk)</Text>
        </View>
        <View style={styles.interpretationRow}>
          <View style={[styles.interpretationDot, { backgroundColor: '#FF6B6B' }]} />
          <Text style={styles.interpretationText}>70-100%: Likely deepfake (High risk)</Text>
        </View>
      </Surface>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <Button
          mode="outlined"
          onPress={shareReport}
          style={styles.actionButton}
          textColor="#FF6B6B"
          icon="share"
          loading={sharing}
        >
          Share Report
        </Button>
      </View>

      <Button
        mode="contained"
        onPress={handleGoHome}
        style={styles.homeButton}
        contentStyle={styles.homeButtonContent}
        labelStyle={styles.homeButtonLabel}
        icon="home"
      >
        Back to Home
      </Button>

      {/* Disclaimer */}
      <Text style={styles.disclaimer}>
        ⚠️ This analysis is for informational purposes only. AI-based detection 
        may produce false positives or negatives. Results should not be used as 
        definitive proof of authenticity or manipulation.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  verdictCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#252525',
  },
  verdictIconContainer: {
    marginBottom: 16,
  },
  verdictText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  confidenceLabel: {
    fontSize: 12,
    color: '#808080',
    marginBottom: 4,
  },
  confidenceValue: {
    fontSize: 52,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  confidenceBarContainer: {
    width: '100%',
    marginBottom: 16,
  },
  confidenceBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#25252580',
  },
  verdictSubtext: {
    fontSize: 13,
    color: '#A0A0A0',
    textAlign: 'center',
    lineHeight: 19,
  },
  indicatorsCard: {
    backgroundColor: '#2A1515',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FF6B6B30',
  },
  indicatorsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 12,
  },
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  indicatorText: {
    fontSize: 13,
    color: '#FFB4B4',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    marginTop: 8,
  },
  methodCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#252525',
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  methodIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodEmoji: {
    fontSize: 20,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  methodDescription: {
    fontSize: 11,
    color: '#707070',
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  methodScore: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  methodProgressBar: {
    height: 5,
    borderRadius: 3,
    backgroundColor: '#252525',
  },
  videoStatsCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#252545',
  },
  videoStatsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  videoStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  videoStat: {
    alignItems: 'center',
  },
  videoStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#A78BFA',
  },
  videoStatLabel: {
    fontSize: 11,
    color: '#808080',
    marginTop: 4,
  },
  detailsCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#252525',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    flex: 1,
    fontSize: 14,
    color: '#A0A0A0',
    marginLeft: 12,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  detailDivider: {
    backgroundColor: '#252525',
  },
  interpretationCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#252525',
  },
  interpretationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  interpretationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  interpretationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  interpretationText: {
    fontSize: 13,
    color: '#808080',
  },
  actionsContainer: {
    marginBottom: 16,
  },
  actionButton: {
    borderColor: '#FF6B6B',
    borderRadius: 12,
  },
  homeButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    marginBottom: 20,
  },
  homeButtonContent: {
    height: 52,
  },
  homeButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  disclaimer: {
    fontSize: 11,
    color: '#606060',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 8,
  },
});
