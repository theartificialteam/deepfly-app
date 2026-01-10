import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  StatusBar,
  SafeAreaView,
  Easing,
} from 'react-native';
import { Text, Surface, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { detectDeepfakeInFile } from '../services/detectionService';
import { useAppStore } from '../store/appStore';

// NEW: Stages that accurately reflect the analysis pipeline
const ANALYSIS_STAGES = [
  { key: 'init', label: 'Initializing Engine...', icon: 'power-plug-outline', range: [0, 0.15] },
  { key: 'load', label: 'Loading Media Frames...', icon: 'image-multiple-outline', range: [0.15, 0.30] },
  { key: 'freq', label: 'Frequency Analysis...', icon: 'chart-bell-curve-cumulative', range: [0.30, 0.44] },
  { key: 'noise', label: 'Noise Pattern Analysis...', icon: 'grain', range: [0.44, 0.58] },
  { key: 'compress', label: 'Compression Analysis...', icon: 'zip-box-outline', range: [0.58, 0.72] },
  { key: 'edge', label: 'Edge Coherence Analysis...', icon: 'vector-square', range: [0.72, 0.86] },
  { key: 'texture', label: 'Texture Analysis...', icon: 'texture-box', range: [0.86, 1.0] },
  { key: 'compile', label: 'Compiling Results...', icon: 'file-chart-outline', range: [0.99, 1.0] },
];

const StageItem = ({ stage, progress }) => {
  const status = progress >= stage.range[1] ? 'completed' : progress >= stage.range[0] ? 'progress' : 'pending';
  const itemAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (status !== 'pending') {
      Animated.timing(itemAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }
  }, [status]);
  
  const getStatusIcon = () => {
    switch (status) {
      case 'completed': return <MaterialCommunityIcons name="check-circle" size={22} color="#10B981" />;
      case 'progress': return <ActivityIndicator animating={true} color="#A78BFA" size={20} />;
      case 'pending': return <MaterialCommunityIcons name="circle-outline" size={22} color="#404040" />;
      default: return null;
    }
  };

  return (
    <Animated.View style={[styles.stageItem, { opacity: itemAnim }]}>
      <View style={styles.stageIcon}>{getStatusIcon()}</View>
      <Text style={[styles.stageLabel, status === 'pending' && {color: '#606060'}]}>{stage.label}</Text>
    </Animated.View>
  );
};


export default function AnalysisScreen({ navigation, route }) {
  const { file, fileType, fileInfo } = route.params;
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const addToHistory = useAppStore((state) => state.addToHistory);
  const incrementUsage = useAppStore((state) => state.incrementUsage);

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    let isMounted = true;
    const runAnalysis = async () => {
      try {
        const result = await detectDeepfakeInFile(file, fileType, { onProgress: (p) => isMounted && setProgress(p) });
        if (isMounted) {
          addToHistory({ ...result, fileInfo, fileType });
          incrementUsage();
          setProgress(1);
          setTimeout(() => navigation.replace('Results', { result }), 500);
        }
      } catch (err) {
        if (isMounted) setError(err.message);
      }
    };
    runAnalysis();
    return () => { isMounted = false; };
  }, []);

  const rotateInterpolate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const rotateInterpolateReverse = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg'] });

  if (error) {
    // Error view remains simple and clear
    return (
      <View style={styles.containerCenter}>
        <Surface style={styles.errorCard} elevation={3}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#FF6B6B" />
          <Text style={styles.errorTitle}>Analysis Failed</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Button mode="outlined" onPress={() => navigation.goBack()} style={{borderColor: '#404040'}} textColor="#FFFFFF">
            Go Back
          </Button>
        </Surface>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#1A1A2E', '#0D0D0D']} style={styles.gradient} />
      
      <View style={styles.scannerContainer}>
        <Animated.View style={[styles.scannerRing, { transform: [{ rotate: rotateInterpolate }] }]} />
        <Animated.View style={[styles.scannerRing, { transform: [{ rotate: rotateInterpolateReverse }], width: '80%', height: '80%', opacity: 0.5 }]} />
        <View style={styles.scannerCore}>
          <Text style={styles.progressPercent}>{Math.round(progress * 100)}%</Text>
          <Text style={styles.progressLabel}>Analyzing</Text>
        </View>
      </View>
      
      <View style={styles.stageList}>
        {ANALYSIS_STAGES.map(stage => <StageItem key={stage.key} stage={stage} progress={progress} />)}
      </View>

      <Text style={styles.privacyText}>
        <MaterialCommunityIcons name="lock-check" size={14} /> All processing is done on your device for complete privacy.
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 40,
  },
  containerCenter: {
      flex: 1,
      backgroundColor: '#0D0D0D',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  scannerContainer: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  scannerRing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 110,
    borderWidth: 2,
    borderColor: 'transparent',
    borderTopColor: '#A78BFA',
    borderLeftColor: '#A78BFA',
  },
  scannerCore: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(26, 26, 46, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.2)',
  },
  progressPercent: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  progressLabel: {
    fontSize: 16,
    color: '#A0A0A0',
    marginTop: -4,
  },
  stageList: {
    width: '90%',
    padding: 20,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#252525',
  },
  stageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  stageIcon: {
    width: 30,
    alignItems: 'center',
    marginRight: 12,
  },
  stageLabel: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  privacyText: {
    fontSize: 12,
    color: '#606060',
    textAlign: 'center',
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  errorCard: {
    width: '100%',
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
    color: '#A0A0A0',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
});

