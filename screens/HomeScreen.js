import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  StatusBar,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Animated,
  Image,
} from 'react-native';
import { Text, Button, Surface, IconButton, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { useAppStore } from '../store/appStore';
import { requestProSubscription } from '../services/iapService';

// Circular Progress Component
const CircularProgress = ({ size, strokeWidth, progress, color }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressValue = progress * circumference;

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: size, height: size, position: 'absolute' }}>
        <View style={{ flex: 1, borderTopWidth: strokeWidth, borderRightWidth: strokeWidth, borderRadius: radius, borderColor: '#252525' }} />
        <View style={{ flex: 1, borderBottomWidth: strokeWidth, borderLeftWidth: strokeWidth, borderRadius: radius, borderColor: '#252525' }} />
      </View>
      <Animated.View
        style={{
          width: size,
          height: size,
          position: 'absolute',
          transform: [{ rotate: `${progress * 360}deg` }],
        }}
      >
        <View style={{ flex: 1, borderTopWidth: strokeWidth, borderRightWidth: strokeWidth, borderRadius: radius, borderColor: color }} />
        <View style={{ flex: 1, borderBottomWidth: strokeWidth, borderLeftWidth: strokeWidth, borderRadius: radius, borderColor: 'transparent' }} />
      </Animated.View>
    </View>
  );
};


export default function HomeScreen({ navigation }) {
  const [upgrading, setUpgrading] = useState(false);
  const user = useAppStore((state) => state.user);
  const usageToday = useAppStore((state) => state.usageToday);
  const dailyLimit = useAppStore((state) => state.dailyLimit);
  const history = useAppStore((state) => state.history);
  const clearUser = useAppStore((state) => state.clearUser);
  const setAnalysisResult = useAppStore((state) => state.setAnalysisResult);
  const updateUserPro = useAppStore((state) => state.updateUserPro);

  // FIX: Use state and effect to sync animations with history data
  const [itemAnims, setItemAnims] = useState([]);
  useEffect(() => {
    setItemAnims(history.map(() => new Animated.Value(0)));
  }, [history.length]);

  useFocusEffect(
    React.useCallback(() => {
      if (itemAnims.length === 0) return;
      const staggers = history.map((_, i) =>
        Animated.timing(itemAnims[i], {
          toValue: 1,
          duration: 300,
          delay: i * 50, // Shorten delay for better UX
          useNativeDriver: true,
        })
      );
      Animated.stagger(50, staggers).start();
    }, [itemAnims])
  );
  
  const canAnalyze = usageToday < dailyLimit;
  const usagePercent = dailyLimit > 0 ? usageToday / dailyLimit : 0;
  const displayName = user?.name || 'User';
  const isGuest = user?.isGuest || false;
  const isPro = user?.isPro || false;

  const handleStartAnalysis = () => {
    if (canAnalyze) navigation.navigate('Upload');
    else handleUpgradePro();
  };

  const handleHistoryItemPress = (item) => {
    setAnalysisResult(item);
    navigation.navigate('Results', { result: item });
  };
  
  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: clearUser },
    ]);
  };

  const handleUpgradePro = async () => {
    setUpgrading(true);
    try {
      const result = await requestProSubscription('monthly');
      if (result.success) {
        await updateUserPro(true);
        Alert.alert('🎉 Welcome to Pro!', 'You now have unlimited analyses.');
      }
    } catch (error) {
      if (error.message !== 'Purchase cancelled') Alert.alert('Purchase Failed', error.message);
    } finally {
      setUpgrading(false);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const diffDays = (new Date() - date) / (1000 * 60 * 60 * 24);
    if (diffDays < 1) return date.toLocaleTimeString();
    if (diffDays < 7) return `${Math.floor(diffDays)}d ago`;
    return date.toLocaleDateString();
  };

  const renderHistoryItem = ({ item, index }) => {
    // Ensure anim value exists before using it
    const animValue = itemAnims[index] || new Animated.Value(1); 
    const animStyle = {
      opacity: animValue,
      transform: [{
        translateY: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [50, 0],
        }),
      }],
    };
    const isFake = item.isProbablyDeepfake;
    const color = isFake ? '#FF6B6B' : '#10B981';

    return (
      <Animated.View style={animStyle}>
        <TouchableOpacity onPress={() => handleHistoryItemPress(item)}>
          <Surface style={styles.historyItem} elevation={2}>
            {item.thumbnailUri ? (
              <Image source={{ uri: item.thumbnailUri }} style={styles.historyThumbnail} />
            ) : (
              <View style={styles.historyThumbnailPlaceholder}>
                <MaterialCommunityIcons name={isFake ? 'robot' : 'image-outline'} size={24} color="#404040" />
              </View>
            )}
            <View style={styles.historyContent}>
              <Text style={styles.historyTitle} numberOfLines={1}>
                {item.fileInfo?.name || 'Analysis Result'}
              </Text>
              <Text style={styles.historyDate}>{formatDate(item.timestamp)}</Text>
            </View>
            <View style={styles.historyRight}>
              <Text style={[styles.historyScore, { color }]}>{item.confidence}%</Text>
              <Text style={styles.historyVerdict}>{isFake ? 'AI' : 'Real'}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#303030" />
          </Surface>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const ListHeader = () => (
    <>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.userName}>{displayName}</Text>
            {isPro && <Chip style={styles.proBadge} textStyle={styles.proBadgeText}>PRO</Chip>}
          </View>
        </View>
        <View style={{ flexDirection: 'row' }}>
            <IconButton icon="account-circle-outline" iconColor="#808080" size={28} onPress={() => navigation.navigate('UserProfile')} />
            <IconButton icon="logout" iconColor="#808080" size={28} onPress={handleLogout} />
        </View>
      </View>

      {/* Usage Card */}
      <Surface style={styles.usageCard} elevation={3}>
        <View style={styles.usageLeft}>
          <Text style={styles.usageTitle}>Analyses Used Today</Text>
          <Text style={styles.usageCount}>{usageToday}
            <Text style={styles.usageLimit}> / {isPro ? '∞' : dailyLimit}</Text>
          </Text>
          <Button
            mode="contained"
            onPress={handleStartAnalysis}
            style={styles.ctaButton}
            labelStyle={styles.ctaLabel}
            icon="plus-circle"
            disabled={!canAnalyze && !isPro}
          >
            New Analysis
          </Button>
        </View>
        <View style={styles.usageRight}>
           <CircularProgress size={80} strokeWidth={8} progress={usagePercent} color={usagePercent >= 1 ? '#FF6B6B' : '#A78BFA'} />
        </View>
      </Surface>
      
      {/* Guest/Pro Upsell */}
      {isGuest && <GuestUpsell onPress={() => navigation.navigate('AuthEmail')} />}
      {!isPro && !isGuest && <ProUpsell onPress={handleUpgradePro} loading={upgrading} />}

      <Text style={styles.sectionTitle}>Recent History</Text>
    </>
  );
  
  const GuestUpsell = ({ onPress }) => (
    <TouchableOpacity onPress={onPress}>
      <Surface style={[styles.upsellCard, styles.guestUpsell]} elevation={2}>
        <MaterialCommunityIcons name="account-plus-outline" size={32} color="#A78BFA" />
        <View style={styles.upsellContent}>
          <Text style={styles.upsellTitle}>Create a Free Account</Text>
          <Text style={styles.upsellText}>Get 20 daily analyses & save your history.</Text>
        </View>
        <MaterialCommunityIcons name="arrow-right" size={24} color="#A78BFA" />
      </Surface>
    </TouchableOpacity>
  );

  const ProUpsell = ({ onPress, loading }) => (
    <TouchableOpacity onPress={onPress} disabled={loading}>
      <Surface style={[styles.upsellCard, styles.proUpsell]} elevation={2}>
        <MaterialCommunityIcons name="star-circle-outline" size={32} color="#FFD700" />
        <View style={styles.upsellContent}>
          <Text style={styles.upsellTitle}>Upgrade to Pro</Text>
          <Text style={styles.upsellText}>Get unlimited analyses & priority support.</Text>
        </View>
        {loading ? <ActivityIndicator color="#FFD700" /> : <MaterialCommunityIcons name="arrow-up-bold-circle" size={24} color="#FFD700" />}
      </Surface>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <FlatList
        data={history}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.id?.toString() || item.timestamp.toString()}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="text-box-search-outline" size={48} color="#303030" />
            <Text style={styles.emptyTitle}>No Analyses Yet</Text>
            <Text style={styles.emptyText}>Start your first analysis to see your history here.</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: 10 },
  welcomeText: { color: '#808080', fontSize: 16 },
  userName: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold' },
  proBadge: { backgroundColor: '#FFD700', marginLeft: 12, height: 22, alignSelf: 'center' },
  proBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#000000' },
  usageCard: { flexDirection: 'row', backgroundColor: '#1A1A1A', borderRadius: 20, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#252525' },
  usageLeft: { flex: 1, justifyContent: 'space-between' },
  usageRight: { justifyContent: 'center', alignItems: 'center', marginLeft: 16 },
  usageTitle: { color: '#A0A0A0', fontSize: 14, marginBottom: 4 },
  usageCount: { color: '#FFFFFF', fontSize: 36, fontWeight: 'bold' },
  usageLimit: { color: '#606060', fontSize: 20 },
  ctaButton: { marginTop: 16, backgroundColor: '#A78BFA', borderRadius: 12 },
  ctaLabel: { fontSize: 15, fontWeight: 'bold' },
  sectionTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  historyItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', borderRadius: 16, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#252525' },
  historyThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: '#222222',
  },
  historyThumbnailPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: '#222222',
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyContent: { flex: 1, paddingVertical: 4 },
  historyTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  historyDate: { color: '#606060', fontSize: 12, marginTop: 4 },
  historyRight: { alignItems: 'flex-end', marginRight: 8 },
  historyScore: { fontSize: 22, fontWeight: 'bold' },
  historyVerdict: { fontSize: 12, color: '#808080' },
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginTop: 16 },
  emptyText: { color: '#606060', fontSize: 14, marginTop: 4, textAlign: 'center' },
  upsellCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1 },
  guestUpsell: { backgroundColor: '#1A1A2E', borderColor: '#A78BFA40' },
  proUpsell: { backgroundColor: '#332E00', borderColor: '#FFD70040' },
  upsellContent: { flex: 1, marginHorizontal: 16 },
  upsellTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  upsellText: { color: '#A0A0A0', fontSize: 12, marginTop: 2 },
});
