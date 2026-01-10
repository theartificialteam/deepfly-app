import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Share, Alert, StatusBar, SafeAreaView, Animated } from 'react-native';
import { Text, Button, Surface, ProgressBar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// ACCURATE and NEW method info
const METHOD_INFO = {
  frequency: { name: 'Frequency', icon: 'chart-bell-curve', description: 'Analyzes frequency domain for AI patterns.' },
  noise: { name: 'Noise', icon: 'grain', description: 'Checks for unnatural noise patterns.' },
  compression: { name: 'Compression', icon: 'zip-box-outline', description: 'Detects non-standard compression artifacts.' },
  edge: { name: 'Edge Coherence', icon: 'vector-square', description: 'Looks for inconsistent edges, a sign of manipulation.' },
  texture: { name: 'Texture', icon: 'texture-box', description: 'Analyzes micro-textures for synthetic patterns.' },
};

const ScoreCircle = ({ progress, size, strokeWidth, verdictColor }) => {
    // Component for the main verdict score visualization
    const AnimatedProgress = Animated.createAnimatedComponent(ProgressBar);
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(anim, {
            toValue: progress,
            duration: 800,
            delay: 200,
            useNativeDriver: false, // ProgressBar progress is not a native prop
        }).start();
    }, [progress]);

    return (
        <View style={[styles.scoreContainer, { width: size, height: size }]}>
            <AnimatedProgress progress={anim} color={verdictColor} style={[styles.scoreProgressBar, { width: size, height: size }]} />
            <View style={[styles.scoreInnerCircle, { width: size - strokeWidth * 2, height: size - strokeWidth * 2, borderRadius: (size - strokeWidth * 2) / 2 }]}>
                 <Text style={[styles.scoreValue, { color: verdictColor }]}>{Math.round(progress * 100)}<Text style={styles.scorePercent}>%</Text></Text>
            </View>
        </View>
    );
};

export default function ResultsScreen({ navigation, route }) {
  const { result } = route.params;
  const [sharing, setSharing] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Animate list items
  const itemAnims = useRef(Object.keys(result.scores).map(() => new Animated.Value(0))).current;
  useEffect(() => {
    const staggers = Object.keys(result.scores).map((_, i) =>
      Animated.timing(itemAnims[i], {
        toValue: 1,
        duration: 400,
        delay: 400 + i * 100,
        useNativeDriver: true,
      })
    );
    Animated.stagger(100, staggers).start();
  }, []);


  const { confidence = 50, isProbablyDeepfake, isAuthentic, fileType = 'image', scores = {} } = result;
  
  let verdictColor, verdictText, verdictIcon;
  if (isProbablyDeepfake) {
    verdictColor = '#FF6B6B';
    verdictText = 'AI-GENERATED';
    verdictIcon = 'robot';
  } else if (isAuthentic) {
    verdictColor = '#10B981';
    verdictText = 'AUTHENTIC';
    verdictIcon = 'check-decagram';
  } else {
    verdictColor = '#FFA502';
    verdictText = 'INCONCLUSIVE';
    verdictIcon = 'help-rhombus';
  }

  const generateReport = () => {
    // ... (report generation logic can remain similar)
    return `DeepFly Analysis Report: ${verdictText} with ${confidence}% confidence.`;
  };

  const shareReport = async () => {
    setSharing(true);
    try {
      await Share.share({ message: generateReport(), title: 'DeepFly Analysis Report' });
    } catch (error) {
      Alert.alert('Error', 'Failed to share report.');
    } finally {
      setSharing(false);
    }
  };
  
  const headerOpacity = scrollY.interpolate({ inputRange: [0, 50], outputRange: [1, 0], extrapolate: 'clamp'});
  const headerTranslateY = scrollY.interpolate({ inputRange: [0, 50], outputRange: [0, -20], extrapolate: 'clamp'});

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Animated.ScrollView
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.header, { opacity: headerOpacity, transform: [{ translateY: headerTranslateY }] }]}>
            <ScoreCircle progress={confidence / 100} size={220} strokeWidth={16} verdictColor={verdictColor} />
            <Text style={[styles.verdictLabel, { color: verdictColor }]}>{verdictText}</Text>
            <Text style={styles.verdictDescription}>
                {isProbablyDeepfake ? 'Strong indicators of AI manipulation found.' : isAuthentic ? 'Media appears to be authentic.' : 'Could not determine with high confidence.'}
            </Text>
        </Animated.View>

        {result.indicators && result.indicators.length > 0 && (
            <Surface style={styles.indicatorsCard} elevation={2}>
                <View style={styles.indicatorsHeader}>
                    <MaterialCommunityIcons name="alert-outline" size={20} color="#FFA502" />
                    <Text style={styles.indicatorsTitle}>Suspicious Indicators</Text>
                </View>
                {result.indicators.slice(0, 4).map((indicator, idx) => (
                    <Text key={idx} style={styles.indicatorText}>• {indicator}</Text>
                ))}
            </Surface>
        )}

        <Text style={styles.sectionTitle}>Analysis Breakdown</Text>
        {Object.entries(scores).filter(([key]) => METHOD_INFO[key]).map(([key, score], index) => {
            const info = METHOD_INFO[key];
            const scoreColor = score >= 65 ? '#FF6B6B' : score >= 35 ? '#FFA502' : '#10B981';
            const animStyle = {
                opacity: itemAnims[index],
                transform: [{
                    translateX: itemAnims[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [-50, 0],
                    }),
                }],
            };

            return (
            <Animated.View key={key} style={animStyle}>
                <Surface style={styles.methodCard} elevation={2}>
                    <MaterialCommunityIcons name={info.icon} size={28} color="#A0A0A0" style={styles.methodIcon} />
                    <View style={styles.methodContent}>
                        <Text style={styles.methodName}>{info.name}</Text>
                        <ProgressBar progress={score / 100} color={scoreColor} style={styles.methodProgress} />
                    </View>
                    <Text style={[styles.methodScore, { color: scoreColor }]}>{score}%</Text>
                </Surface>
            </Animated.View>
            );
        })}
      </Animated.ScrollView>

      <View style={styles.footer}>
        <Button mode="text" onPress={() => navigation.navigate('Upload')} textColor="#A0A0A0">New Analysis</Button>
        <Button mode="contained" onPress={() => navigation.popToTop()} style={styles.homeButton} labelStyle={{fontWeight: 'bold'}}>Done</Button>
        <Button mode="text" onPress={shareReport} loading={sharing} textColor="#A0A0A0">Share</Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  content: { padding: 20, paddingBottom: 100 },
  header: { alignItems: 'center', marginBottom: 24 },
  verdictLabel: { fontSize: 24, fontWeight: 'bold', letterSpacing: 2, marginTop: 20 },
  verdictDescription: { fontSize: 16, color: '#A0A0A0', textAlign: 'center', marginTop: 8 },
  scoreContainer: { justifyContent: 'center', alignItems: 'center' },
  scoreProgressBar: { position: 'absolute', borderRadius: 1000, backgroundColor: '#1A1A1A' },
  scoreInnerCircle: { backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#252525'},
  scoreValue: { fontSize: 56, fontWeight: 'bold' },
  scorePercent: { fontSize: 24, fontWeight: 'bold', color: '#606060' },
  indicatorsCard: { backgroundColor: '#332E00', borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#FFA50240' },
  indicatorsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  indicatorsTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFA502', marginLeft: 8 },
  indicatorText: { fontSize: 14, color: '#D0D0D0', marginBottom: 5, lineHeight: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 12 },
  methodCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', borderRadius: 12, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#252525' },
  methodIcon: { marginRight: 16 },
  methodContent: { flex: 1 },
  methodName: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  methodProgress: { height: 6, borderRadius: 3, marginTop: 8, backgroundColor: '#303030' },
  methodScore: { fontSize: 22, fontWeight: 'bold', marginLeft: 16 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 10, paddingBottom: 25, backgroundColor: '#151515E0', borderTopWidth: 1, borderColor: '#252525'},
  homeButton: { borderRadius: 16, backgroundColor: '#A78BFA', paddingHorizontal: 20 },
});
