import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Text,
  Button,
  Surface,
  ProgressBar,
  Chip,
  IconButton,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAppStore } from '../store/appStore';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const user = useAppStore((state) => state.user);
  const usageToday = useAppStore((state) => state.usageToday);
  const dailyLimit = useAppStore((state) => state.dailyLimit);
  const history = useAppStore((state) => state.history);
  const clearUser = useAppStore((state) => state.clearUser);
  const setAnalysisResult = useAppStore((state) => state.setAnalysisResult);
  const setCurrentAnalysis = useAppStore((state) => state.setCurrentAnalysis);

  const recentHistory = history.slice(0, 5);
  const canAnalyze = usageToday < dailyLimit;
  const usagePercent = dailyLimit > 0 ? usageToday / dailyLimit : 0;

  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  const isGuest = user?.isGuest || false;
  const isPro = user?.isPro || false;

  const handleStartAnalysis = () => {
    if (!canAnalyze) {
      Alert.alert(
        'Daily Limit Reached',
        isGuest
          ? 'You have used all 5 free guest analyses today. Create an account for 20 daily analyses!'
          : isPro
          ? 'You have reached your daily limit. Please try again tomorrow.'
          : 'You have used all 20 analyses today. Upgrade to Pro for 100 daily analyses!',
        [
          { text: 'Cancel', style: 'cancel' },
          isGuest
            ? { text: 'Create Account', onPress: () => navigation.navigate('AuthEmail') }
            : !isPro
            ? { text: 'Learn About Pro', onPress: () => {} }
            : null,
        ].filter(Boolean)
      );
      return;
    }
    navigation.navigate('Upload');
  };

  const handleHistoryItemPress = (item) => {
    // Set the result and navigate to Results screen
    setAnalysisResult(item);
    setCurrentAnalysis({
      fileType: item.fileType,
      fileInfo: item.fileInfo,
    });
    navigation.navigate('Results', { result: item });
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => clearUser() },
      ]
    );
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={['#FF6B6B15', '#0D0D0D']}
          style={styles.headerGradient}
        >
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={styles.welcomeRow}>
                <Text style={styles.welcomeText}>Welcome,</Text>
                {isPro && (
                  <Chip
                    style={styles.proBadge}
                    textStyle={styles.proBadgeText}
                  >
                    PRO
                  </Chip>
                )}
              </View>
              <Text style={styles.userName}>{displayName}</Text>
            </View>
            <IconButton
              icon="logout"
              iconColor="#808080"
              size={24}
              onPress={handleLogout}
            />
          </View>

          {/* Usage Stats */}
          <Surface style={styles.usageCard} elevation={2}>
            <View style={styles.usageHeader}>
              <MaterialCommunityIcons
                name="chart-arc"
                size={20}
                color="#FF6B6B"
              />
              <Text style={styles.usageTitle}>Today's Usage</Text>
            </View>
            <View style={styles.usageStats}>
              <Text style={styles.usageCount}>
                {usageToday}
                <Text style={styles.usageLimit}> / {dailyLimit}</Text>
              </Text>
              <Text style={styles.usageLabel}>analyses</Text>
            </View>
            <ProgressBar
              progress={usagePercent}
              color={usagePercent >= 1 ? '#FF6B6B' : '#10B981'}
              style={styles.usageBar}
            />
            {!canAnalyze && (
              <Text style={styles.limitReachedText}>
                Daily limit reached
              </Text>
            )}
          </Surface>
        </LinearGradient>

        {/* Main CTA */}
        <View style={styles.ctaSection}>
          <Button
            mode="contained"
            onPress={handleStartAnalysis}
            style={[styles.ctaButton, !canAnalyze && styles.ctaButtonDisabled]}
            contentStyle={styles.ctaButtonContent}
            labelStyle={styles.ctaButtonLabel}
            icon="magnify-scan"
            disabled={!canAnalyze}
          >
            Start New Analysis
          </Button>
          {!canAnalyze && (
            <Text style={styles.ctaDisabledText}>
              {isGuest
                ? 'Create an account for more analyses'
                : 'Upgrade to Pro for more analyses'}
            </Text>
          )}
        </View>

        {/* Guest Account Prompt */}
        {isGuest && (
          <Surface style={styles.guestPromptCard} elevation={2}>
            <MaterialCommunityIcons
              name="account-plus"
              size={32}
              color="#FF6B6B"
            />
            <View style={styles.guestPromptContent}>
              <Text style={styles.guestPromptTitle}>Create a Free Account</Text>
              <Text style={styles.guestPromptText}>
                Get 20 daily analyses and save your history across devices.
              </Text>
            </View>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('AuthEmail')}
              style={styles.guestPromptButton}
              compact
            >
              Sign Up
            </Button>
          </Surface>
        )}

        {/* Recent History */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Recent Analyses</Text>
          
          {recentHistory.length === 0 ? (
            <Surface style={styles.emptyHistoryCard} elevation={1}>
              <MaterialCommunityIcons
                name="history"
                size={40}
                color="#404040"
              />
              <Text style={styles.emptyHistoryText}>
                No analyses yet. Start your first scan!
              </Text>
            </Surface>
          ) : (
            <>
              {recentHistory.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handleHistoryItemPress(item)}
                  activeOpacity={0.7}
                >
                  <Surface style={styles.historyItem} elevation={1}>
                    <View style={styles.historyItemLeft}>
                      <View style={[
                        styles.historyItemIcon,
                        item.isProbablyDeepfake
                          ? styles.historyItemIconFake
                          : styles.historyItemIconReal
                      ]}>
                        <MaterialCommunityIcons
                          name={item.isProbablyDeepfake ? 'alert' : 'check'}
                          size={18}
                          color={item.isProbablyDeepfake ? '#FF6B6B' : '#10B981'}
                        />
                      </View>
                      <View style={styles.historyItemInfo}>
                        <Text style={styles.historyItemTitle}>
                          {item.fileInfo?.name?.slice(0, 20) || item.fileType || 'Analysis'}
                          {item.fileInfo?.name?.length > 20 ? '...' : ''}
                        </Text>
                        <Text style={styles.historyItemDate}>
                          {formatDate(item.timestamp)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.historyItemRight}>
                      <Text style={[
                        styles.historyItemConfidence,
                        item.isProbablyDeepfake
                          ? styles.confidenceFake
                          : styles.confidenceReal
                      ]}>
                        {item.confidence}%
                      </Text>
                      <Chip
                        style={[
                          styles.verdictChip,
                          item.isProbablyDeepfake
                            ? styles.verdictChipFake
                            : styles.verdictChipReal
                        ]}
                        textStyle={styles.verdictChipText}
                        compact
                      >
                        {item.isProbablyDeepfake ? 'Fake' : 'Real'}
                      </Chip>
                    </View>
                  </Surface>
                </TouchableOpacity>
              ))}
              
              {isGuest && history.length > 0 && (
                <Text style={styles.historyNote}>
                  ⚠️ History is stored only on this device. Create an account to keep it safe.
                </Text>
              )}
            </>
          )}
        </View>

        {/* Pro Upsell */}
        {!isPro && !isGuest && (
          <Surface style={styles.proUpsellCard} elevation={2}>
            <View style={styles.proUpsellHeader}>
              <MaterialCommunityIcons
                name="star"
                size={24}
                color="#FFD700"
              />
              <Text style={styles.proUpsellTitle}>Upgrade to Pro</Text>
              <Chip style={styles.comingSoonChip} textStyle={styles.comingSoonText} compact>
                Coming Soon
              </Chip>
            </View>
            <View style={styles.proFeatures}>
              {[
                '100 analyses per day',
                'Extended history storage',
                'Priority processing',
                'Advanced reports',
              ].map((feature, index) => (
                <View key={index} style={styles.proFeatureRow}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={16}
                    color="#10B981"
                  />
                  <Text style={styles.proFeatureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </Surface>
        )}

        {/* Spacer */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  headerGradient: {
    paddingTop: StatusBar.currentHeight + 20 || 60,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 14,
    color: '#808080',
  },
  proBadge: {
    backgroundColor: '#FFD700',
    marginLeft: 8,
    height: 24,
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000000',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  usageCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#252525',
  },
  usageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  usageTitle: {
    fontSize: 14,
    color: '#A0A0A0',
    marginLeft: 8,
  },
  usageStats: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  usageCount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  usageLimit: {
    fontSize: 18,
    color: '#808080',
  },
  usageLabel: {
    fontSize: 14,
    color: '#808080',
    marginLeft: 8,
  },
  usageBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#252525',
  },
  limitReachedText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginTop: 8,
    textAlign: 'center',
  },
  ctaSection: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  ctaButton: {
    borderRadius: 16,
    backgroundColor: '#FF6B6B',
  },
  ctaButtonDisabled: {
    backgroundColor: '#404040',
  },
  ctaButtonContent: {
    height: 60,
  },
  ctaButtonLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  ctaDisabledText: {
    fontSize: 12,
    color: '#808080',
    textAlign: 'center',
    marginTop: 8,
  },
  guestPromptCard: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: '#FF6B6B15',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF6B6B30',
  },
  guestPromptContent: {
    flex: 1,
    marginLeft: 12,
  },
  guestPromptTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  guestPromptText: {
    fontSize: 12,
    color: '#A0A0A0',
    marginTop: 2,
  },
  guestPromptButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
  },
  historySection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  emptyHistoryCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#252525',
  },
  emptyHistoryText: {
    fontSize: 14,
    color: '#606060',
    marginTop: 12,
    textAlign: 'center',
  },
  historyItem: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#252525',
  },
  historyItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  historyItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyItemIconFake: {
    backgroundColor: '#FF6B6B20',
  },
  historyItemIconReal: {
    backgroundColor: '#10B98120',
  },
  historyItemInfo: {
    flex: 1,
  },
  historyItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  historyItemDate: {
    fontSize: 12,
    color: '#606060',
    marginTop: 2,
  },
  historyItemRight: {
    alignItems: 'flex-end',
  },
  historyItemConfidence: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  confidenceFake: {
    color: '#FF6B6B',
  },
  confidenceReal: {
    color: '#10B981',
  },
  verdictChip: {
    height: 22,
  },
  verdictChipFake: {
    backgroundColor: '#FF6B6B30',
  },
  verdictChipReal: {
    backgroundColor: '#10B98130',
  },
  verdictChipText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  historyNote: {
    fontSize: 11,
    color: '#606060',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  proUpsellCard: {
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFD70030',
  },
  proUpsellHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  proUpsellTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
    flex: 1,
  },
  comingSoonChip: {
    backgroundColor: '#404040',
  },
  comingSoonText: {
    fontSize: 10,
    color: '#A0A0A0',
  },
  proFeatures: {
    marginLeft: 4,
  },
  proFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  proFeatureText: {
    fontSize: 13,
    color: '#A0A0A0',
    marginLeft: 8,
  },
});
