/**
 * 📊 RESULTS SCREEN - Cockpit UI
 * =================================
 * A data-rich, minimalist, "cockpit" style report screen.
 * Displays a main verdict and simulated sub-system metrics from the server.
 */

import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Image, ActivityIndicator, StatusBar } from 'react-native';
import { Text, Button, Surface, ProgressBar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Maps metric keys from server to display names and icons
const METRIC_INFO = {
  texture_consistency: { name: 'Texture', icon: 'texture-box' },
  edge_artifacts: { name: 'Edges', icon: 'vector-square' },
  lighting_inconsistencies: { name: 'Lighting', icon: 'lightbulb-on-outline' },
  facial_structure: { name: 'Structure', icon: 'face-recognition' },
};

// A single gauge for a sub-system metric
const MetricGauge = ({ metric, score }) => {
    const scoreColor = score >= 65 ? '#E53935' : score >= 35 ? '#FDD835' : '#43A047';
    return (
        <View style={styles.metricRow}>
            <MaterialCommunityIcons name={METRIC_INFO[metric]?.icon || 'help-circle'} size={20} color="#8899A6" style={styles.metricIcon} />
            <Text style={styles.metricName}>{METRIC_INFO[metric]?.name || 'Unknown'}</Text>
            <View style={styles.metricBarContainer}>
                <View style={[styles.metricBar, { width: `${score}%`, backgroundColor: scoreColor }]} />
            </View>
            <Text style={styles.metricScore}>{score}%</Text>
        </View>
    );
};

export default function ResultsScreen({ navigation, route }) {
  const { result } = route.params || {};
  
  // Guard clause for missing or invalid result object
  if (!result || typeof result.confidence === 'undefined') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <Text style={styles.errorText}>Error loading results...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { 
    confidence, 
    isProbablyDeepfake, 
    isAuthentic, 
    thumbnailUri,
    metrics = {},
  } = result;
  
  const verdictColor = isProbablyDeepfake ? '#E53935' : (isAuthentic ? '#43A047' : '#FDD835');
  const verdictText = isProbablyDeepfake ? 'AI / MANIPULATED' : (isAuthentic ? 'AUTHENTIC' : 'INCONCLUSIVE');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.headerTitle}>Analysis Cockpit</Text>

        {thumbnailUri && (
          <Surface style={styles.thumbnailCard} elevation={4}>
            <Image source={{ uri: thumbnailUri }} style={styles.thumbnail} resizeMode="cover" />
          </Surface>
        )}

        <Surface style={styles.mainCard} elevation={4}>
          <View style={styles.mainScoreHeader}>
            <Text style={styles.mainScoreTitle}>AI Confidence Score</Text>
            <Text style={[styles.mainVerdict, { color: verdictColor }]}>{verdictText}</Text>
          </View>
          <Text style={[styles.mainScore, { color: verdictColor }]}>{confidence}<Text style={styles.percentSign}>%</Text></Text>
          <Text style={styles.mainDescription}>This score represents the model's confidence that the media is AI-generated.</Text>
        </Surface>

        {metrics && Object.keys(metrics).length > 0 && (
          <Surface style={styles.metricsCard} elevation={2}>
              <Text style={styles.metricsTitle}>Sub-System Analysis</Text>
              {Object.entries(metrics).map(([key, score]) => (
                  <MetricGauge key={key} metric={key} score={score || 0} />
              ))}
          </Surface>
        )}

        {isProbablyDeepfake && (
            <Surface style={styles.explanationCard} elevation={2}>
                <Text style={styles.explanationTitle}>Verdict Explanation</Text>
                <Text style={styles.explanationBody}>
                    High scores in sub-systems like <Text style={styles.boldText}>Texture</Text> and <Text style={styles.boldText}>Edges</Text> suggest the presence of digital patterns inconsistent with real-world cameras, contributing to the AI-generated verdict.
                </Text>
            </Surface>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button mode="outlined" onPress={() => navigation.popToTop()} style={styles.footerButton} textColor="#8899A6">Done</Button>
        <Button mode="contained" onPress={() => navigation.navigate('Upload')} style={styles.footerButtonPrimary}>New Analysis</Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#808080', marginTop: 10 },
  content: { padding: 16, paddingBottom: 100 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 16, paddingLeft: 8 },
  
  thumbnailCard: {
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2F3336',
    height: 200,
    backgroundColor: '#151718',
  },
  thumbnail: {
    flex: 1,
    borderRadius: 16,
  },

  mainCard: { backgroundColor: '#151718', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#2F3336' },
  mainScoreHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mainScoreTitle: { fontSize: 16, color: '#8899A6' },
  mainVerdict: { fontSize: 16, fontWeight: 'bold' },
  mainScore: { fontSize: 72, fontWeight: 'bold', marginVertical: 8, letterSpacing: -2 },
  percentSign: { fontSize: 36, color: '#45484A' },
  mainDescription: { fontSize: 14, color: '#8899A6', lineHeight: 20 },

  metricsCard: { backgroundColor: '#151718', borderRadius: 16, padding: 20, marginTop: 8, borderWidth: 1, borderColor: '#2F3336' },
  metricsTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 20 },
  metricRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  metricIcon: { width: 24 },
  metricName: { fontSize: 15, color: '#E1E8ED', width: 110, marginLeft: 8 },
  metricBarContainer: { flex: 1, height: 10, backgroundColor: '#2F3336', borderRadius: 5, marginHorizontal: 12 },
  metricBar: { height: '100%', borderRadius: 5 },
  metricScore: { fontSize: 15, color: '#FFFFFF', fontWeight: '600', width: 40, textAlign: 'right' },
  
  explanationCard: { backgroundColor: 'rgba(229, 57, 53, 0.05)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(229, 57, 53, 0.2)', marginTop: 16},
  explanationTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 },
  explanationBody: { fontSize: 14, color: '#B0B8C0', lineHeight: 20 },
  boldText: { fontWeight: 'bold', color: '#E1E8ED' },

  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 12, paddingBottom: 30, backgroundColor: 'rgba(0,0,0,0.8)', borderTopWidth: 1, borderColor: '#2F3336'},
  footerButton: { borderColor: '#2F3336', borderRadius: 12, flex: 1, marginHorizontal: 8 },
  footerButtonPrimary: { backgroundColor: '#1D9BF0', borderRadius: 12, flex: 2, marginHorizontal: 8 },
});
