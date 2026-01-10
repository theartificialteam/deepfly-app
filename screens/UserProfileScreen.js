import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Avatar, Text, Surface, Button, List, Divider, Chip } from 'react-native-paper';
import { useAppStore } from '../store/appStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function UserProfileScreen({ navigation }) {
  const user = useAppStore((state) => state.user);
  const history = useAppStore((state) => state.history);
  const clearUser = useAppStore((state) => state.clearUser);
  const dailyLimit = useAppStore((state) => state.dailyLimit);

  const displayName = user?.name || 'User';
  const displayEmail = user?.email || 'guest@deepfly.app';
  const isPro = user?.isPro || false;

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => {
        navigation.popToTop();
        setTimeout(clearUser, 500);
      }},
    ]);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Avatar.Icon size={80} icon="account-circle" style={styles.avatar} />
          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.userEmail}>{displayEmail}</Text>
          <Chip 
            icon={isPro ? "star-circle" : "account-outline"} 
            style={[styles.statusChip, isPro && styles.proChip]}
            textStyle={[styles.statusChipText, isPro && styles.proChipText]}
          >
            {isPro ? 'Pro Member' : 'Free User'}
          </Chip>
        </View>

        <Surface style={styles.statsCard} elevation={2}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{history.length}</Text>
            <Text style={styles.statLabel}>Total Analyses</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{dailyLimit}</Text>
            <Text style={styles.statLabel}>Daily Limit</Text>
          </View>
        </Surface>

        {!isPro && (
            <Surface style={styles.upsellCard} elevation={3}>
                <MaterialCommunityIcons name="rocket-launch" size={32} color="#A78BFA" />
                <View style={styles.upsellContent}>
                    <Text style={styles.upsellTitle}>Go Unlimited with Pro</Text>
                    <Text style={styles.upsellText}>Get unlimited analyses and priority support.</Text>
                </View>
                <Button mode="contained" style={{backgroundColor: '#A78BFA'}}>Upgrade</Button>
            </Surface>
        )}

        <Surface style={styles.menuCard} elevation={2}>
            <List.Item
                title="Terms of Service"
                left={props => <List.Icon {...props} icon="file-document-outline" />}
                right={props => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => navigation.navigate('Legal')}
            />
            <Divider />
            <List.Item
                title="Privacy Policy"
                left={props => <List.Icon {...props} icon="shield-lock-outline" />}
                right={props => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => navigation.navigate('Legal')}
            />
        </Surface>

        <Button 
            mode="contained" 
            onPress={handleLogout} 
            style={styles.logoutButton}
            icon="logout"
        >
          Sign Out
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    backgroundColor: '#333',
    marginBottom: 12,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userEmail: {
    fontSize: 16,
    color: '#808080',
    marginBottom: 12,
  },
  statusChip: {
    backgroundColor: '#252525',
  },
  statusChipText: {
    color: '#A0A0A0',
  },
  proChip: {
      backgroundColor: '#FFD700',
  },
  proChipText: {
      color: '#000',
      fontWeight: 'bold',
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderRadius: 16,
    backgroundColor: '#1A1A1A',
    padding: 20,
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#808080',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#303030',
  },
  upsellCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    backgroundColor: '#1A1A2E', 
    borderColor: '#A78BFA40'
  },
  upsellContent: {
      flex: 1,
      marginHorizontal: 16
  },
  upsellTitle: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: 'bold'
  },
  upsellText: {
      color: '#A0A0A0',
      fontSize: 12,
      marginTop: 2
  },
  menuCard: {
    borderRadius: 16,
    backgroundColor: '#1A1A1A',
    marginBottom: 24,
  },
  logoutButton: {
    backgroundColor: '#FF6B6B20',
    borderRadius: 12,
  }
});
