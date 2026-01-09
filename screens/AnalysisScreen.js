import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Text, ProgressBar, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { detectDeepfakeInFile } from '../services/detectionService';
import { useAppStore } from '../store/appStore';

const { width } = Dimensions.get('window');

const ANALYSIS_STAGES = [
  { id: 1, label: 'Loading AI models...', icon: 'brain', range: [0, 0.20] },
  { id: 2, label: 'Preparing frames...', icon: 'image-filter-frames', range: [0.20, 0.40] },
  { id: 3, label: 'Running face detection...', icon: 'face-recognition', range: [0.40, 0.55] },
  { id: 4, label: 'Analyzing facial features...', icon: 'chart-scatter-plot', range: [0.55, 0.70] },
  { id: 5, label: 'Running liveness check...', icon: 'eye-check', range: [0.70, 0.85] },
  { id: 6, label: 'Computing ensemble score...', icon: 'calculator', range: [0.85, 0.95] },
  { id: 7, label: 'Preparing results...', icon: 'check-circle', range: [0.95, 1.0] },
];

export default function AnalysisScreen({ navigation, route }) {
  const { file, fileType, fileInfo } = route.params;
  
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(ANALYSIS_STAGES[0]);
  const [error, setError] = useState(null);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  const setAnalysisResult = useAppStore((state) => state.setAnalysisResult);
  const addToHistory = useAppStore((state) => state.addToHistory);

  // Pulse animation for the icon
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  // Rotation animation
  useEffect(() => {
    const rotate = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    );
    rotate.start();
    return () => rotate.stop();
  }, [rotateAnim]);

  // Update current stage based on progress
  useEffect(() => {
    const stage = ANALYSIS_STAGES.find(
      (s) => progress >= s.range[0] && progress < s.range[1]
    );
    if (stage) {
      setCurrentStage(stage);
    }
  }, [progress]);

  // Run analysis
  useEffect(() => {
    let isMounted = true;

    const runAnalysis = async () => {
      try {
        // Progress callback
        const onProgress = (value) => {
          if (isMounted) {
            setProgress(value);
          }
        };

        // Run the detection
        const result = await detectDeepfakeInFile(
          file,
          fileType,
          { onProgress }
        );

        if (isMounted) {
          // Store result
          setAnalysisResult(result);
          addToHistory({
            ...result,
            fileInfo,
            fileType,
          });

          // Complete progress and navigate
          setProgress(1);
          
          // Small delay before navigation for visual completion
          setTimeout(() => {
            if (isMounted) {
              navigation.replace('Results', { result });
            }
          }, 500);
        }
      } catch (err) {
        console.error('Analysis error:', err);
        if (isMounted) {
          setError(err.message);
        }
      }
    };

    runAnalysis();

    return () => {
      isMounted = false;
    };
  }, [file, fileType]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (error) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <Surface style={styles.errorCard} elevation={3}>
          <MaterialCommunityIcons
            name="alert-circle"
            size={48}
            color="#FF6B6B"
          />
          <Text style={styles.errorTitle}>Analysis Failed</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Text
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            ← Go Back
          </Text>
        </Surface>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={['#FF6B6B15', '#0D0D0D']}
        style={styles.gradient}
      >
        {/* Animated Icon */}
        <View style={styles.iconContainer}>
          <Animated.View
            style={[
              styles.rotatingRing,
              { transform: [{ rotate: rotateInterpolate }] },
            ]}
          >
            <View style={styles.ringInner} />
          </Animated.View>
          
          <Animated.View
            style={[
              styles.pulsingIcon,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <MaterialCommunityIcons
              name={currentStage.icon}
              size={48}
              color="#FF6B6B"
            />
          </Animated.View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Analyzing Media</Text>
        <Text style={styles.subtitle}>
          {fileType === 'video' ? 'Processing video frames...' : 'Processing image...'}
        </Text>

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressPercent}>
              {Math.round(progress * 100)}%
            </Text>
          </View>
          
          <ProgressBar
            progress={progress}
            color="#FF6B6B"
            style={styles.progressBar}
          />
        </View>

        {/* Current Stage */}
        <Surface style={styles.stageCard} elevation={2}>
          <View style={styles.stageIconContainer}>
            <MaterialCommunityIcons
              name={currentStage.icon}
              size={24}
              color="#FF6B6B"
            />
          </View>
          <View style={styles.stageTextContainer}>
            <Text style={styles.stageNumber}>
              Step {currentStage.id} of {ANALYSIS_STAGES.length}
            </Text>
            <Text style={styles.stageLabel}>{currentStage.label}</Text>
          </View>
        </Surface>

        {/* Model Progress Cards */}
        <View style={styles.modelsGrid}>
          {[
            { name: 'Face Detection', icon: 'face-recognition', done: progress > 0.55 },
            { name: 'Forensics Model', icon: 'magnify', done: progress > 0.70 },
            { name: 'Liveness Check', icon: 'eye', done: progress > 0.85 },
            { name: 'Symmetry Analysis', icon: 'chart-line', done: progress > 0.90 },
          ].map((model, index) => (
            <Surface
              key={index}
              style={[
                styles.modelCard,
                model.done && styles.modelCardDone,
              ]}
              elevation={1}
            >
              <MaterialCommunityIcons
                name={model.done ? 'check-circle' : model.icon}
                size={20}
                color={model.done ? '#10B981' : '#808080'}
              />
              <Text
                style={[
                  styles.modelName,
                  model.done && styles.modelNameDone,
                ]}
              >
                {model.name}
              </Text>
            </Surface>
          ))}
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <MaterialCommunityIcons
            name="shield-lock"
            size={16}
            color="#808080"
          />
          <Text style={styles.infoText}>
            All processing happens on-device. Your media stays private.
          </Text>
        </View>
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
    paddingTop: StatusBar.currentHeight + 60 || 100,
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  rotatingRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#FF6B6B30',
    borderTopColor: '#FF6B6B',
  },
  ringInner: {
    width: '100%',
    height: '100%',
  },
  pulsingIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF6B6B15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#808080',
    marginBottom: 40,
  },
  progressSection: {
    width: '100%',
    marginBottom: 32,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    color: '#A0A0A0',
  },
  progressPercent: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#252525',
  },
  stageCard: {
    width: '100%',
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#252525',
  },
  stageIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FF6B6B15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stageTextContainer: {
    flex: 1,
  },
  stageNumber: {
    fontSize: 12,
    color: '#808080',
    marginBottom: 4,
  },
  stageLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  modelCard: {
    width: (width - 60) / 2,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#252525',
  },
  modelCardDone: {
    borderColor: '#10B98140',
    backgroundColor: '#10B98110',
  },
  modelName: {
    fontSize: 12,
    color: '#808080',
    marginLeft: 8,
    flex: 1,
  },
  modelNameDone: {
    color: '#10B981',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 40,
  },
  infoText: {
    fontSize: 12,
    color: '#808080',
    marginLeft: 8,
  },
  errorCard: {
    margin: 24,
    padding: 32,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF6B6B30',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#808080',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    fontSize: 14,
    color: '#FF6B6B',
    marginTop: 24,
    fontWeight: '600',
  },
});

