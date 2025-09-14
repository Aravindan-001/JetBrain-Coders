import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

const EXPO_PUBLIC_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface User {
  id: string;
  name: string;
  email: string;
  points: number;
  level: number;
  badges: string[];
}

interface ProgressLevel {
  level: number;
  minPoints: number;
  maxPoints: number;
  title: string;
  color: string;
}

const LEVELS: ProgressLevel[] = [
  { level: 1, minPoints: 0, maxPoints: 99, title: 'Beginner', color: '#95A5A6' },
  { level: 2, minPoints: 100, maxPoints: 299, title: 'Explorer', color: '#3498DB' },
  { level: 3, minPoints: 300, maxPoints: 599, title: 'Intermediate', color: '#E67E22' },
  { level: 4, minPoints: 600, maxPoints: 999, title: 'Advanced', color: '#9B59B6' },
  { level: 5, minPoints: 1000, maxPoints: 9999, title: 'Pro', color: '#E74C3C' },
];

const BADGE_ICONS: { [key: string]: string } = {
  'Quiz Master': 'school',
  'Skill Explorer': 'compass',
  'Knowledge Seeker': 'library',
  'Rising Star': 'star',
  'Career Pro': 'trophy',
};

export default function Dashboard() {
  const { userId } = useLocalSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/users/${userId}`);
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        Alert.alert('Error', 'Failed to load user data');
        router.back();
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load user data');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLevel = (): ProgressLevel => {
    if (!user) return LEVELS[0];
    return LEVELS.find(level => user.level === level.level) || LEVELS[0];
  };

  const getNextLevel = (): ProgressLevel | null => {
    if (!user) return null;
    return LEVELS.find(level => level.level === user.level + 1) || null;
  };

  const calculateProgress = (): number => {
    if (!user) return 0;
    const currentLevel = getCurrentLevel();
    const nextLevel = getNextLevel();
    
    if (!nextLevel) return 100; // Max level reached
    
    const pointsInCurrentLevel = user.points - currentLevel.minPoints;
    const pointsNeededForNext = nextLevel.minPoints - currentLevel.minPoints;
    
    return Math.min((pointsInCurrentLevel / pointsNeededForNext) * 100, 100);
  };

  const addExplorationPoints = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/users/${userId}/add-points?points=10`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const result = await response.json();
        setUser({
          ...user,
          points: result.total_points,
          level: result.level,
          badges: result.badges
        });
        Alert.alert('Points Earned!', `You earned 10 XP for exploring the dashboard!`);
      }
    } catch (error) {
      console.error('Error adding points:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>User not found</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();
  const progress = calculateProgress();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <TouchableOpacity onPress={addExplorationPoints} style={styles.pointsButton}>
          <Ionicons name="add-circle" size={24} color="#34C759" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={40} color="white" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="star" size={32} color="#FFD700" />
            <Text style={styles.statValue}>{user.points}</Text>
            <Text style={styles.statLabel}>XP Points</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="trending-up" size={32} color={currentLevel.color} />
            <Text style={styles.statValue}>Level {user.level}</Text>
            <Text style={styles.statLabel}>{currentLevel.title}</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="medal" size={32} color="#FF6B6B" />
            <Text style={styles.statValue}>{user.badges.length}</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </View>
        </View>

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Progress to Next Level</Text>
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.currentLevelText}>
                Level {user.level} - {currentLevel.title}
              </Text>
              {nextLevel && (
                <Text style={styles.nextLevelText}>
                  Next: Level {nextLevel.level} - {nextLevel.title}
                </Text>
              )}
            </View>
            
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${progress}%`, backgroundColor: currentLevel.color }
                  ]} 
                />
              </View>
              <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
            </View>
            
            {nextLevel && (
              <Text style={styles.pointsNeeded}>
                {nextLevel.minPoints - user.points} XP needed for next level
              </Text>
            )}
          </View>
        </View>

        {/* Badges Section */}
        <View style={styles.badgesSection}>
          <Text style={styles.sectionTitle}>Your Badges</Text>
          <View style={styles.badgesContainer}>
            {user.badges.length > 0 ? (
              user.badges.map((badge, index) => (
                <View key={index} style={styles.badge}>
                  <Ionicons 
                    name={BADGE_ICONS[badge] as any || 'medal'} 
                    size={24} 
                    color="#FFD700" 
                  />
                  <Text style={styles.badgeText}>{badge}</Text>
                </View>
              ))
            ) : (
              <View style={styles.noBadges}>
                <Ionicons name="medal-outline" size={48} color="#BDC3C7" />
                <Text style={styles.noBadgesText}>No badges earned yet</Text>
                <Text style={styles.noBadgesSubtext}>Complete quizzes and explore to earn badges!</Text>
              </View>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push({
                pathname: '/quiz',
                params: { userId: user.id }
              })}
            >
              <Ionicons name="help-circle" size={24} color="#007AFF" />
              <Text style={styles.actionButtonText}>Take Quiz</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push({
                pathname: '/roadmaps',
                params: { userId: user.id }
              })}
            >
              <Ionicons name="map" size={24} color="#34C759" />
              <Text style={styles.actionButtonText}>View Roadmaps</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Tips to Earn More XP</Text>
          <View style={styles.tipsList}>
            <View style={styles.tip}>
              <Ionicons name="checkmark-circle" size={20} color="#34C759" />
              <Text style={styles.tipText}>Complete the career quiz (+50 XP)</Text>
            </View>
            <View style={styles.tip}>
              <Ionicons name="checkmark-circle" size={20} color="#34C759" />
              <Text style={styles.tipText}>Explore career roadmaps (+20 XP each)</Text>
            </View>
            <View style={styles.tip}>
              <Ionicons name="checkmark-circle" size={20} color="#34C759" />
              <Text style={styles.tipText}>Visit the dashboard daily (+10 XP)</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  pointsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  userEmail: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 4,
  },
  progressSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  progressCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressHeader: {
    marginBottom: 16,
  },
  currentLevelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  nextLevelText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 4,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    minWidth: 40,
  },
  pointsNeeded: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  badgesSection: {
    marginBottom: 16,
  },
  badgesContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F2F6',
  },
  badgeText: {
    fontSize: 16,
    color: '#2C3E50',
    marginLeft: 12,
  },
  noBadges: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noBadgesText: {
    fontSize: 16,
    color: '#7F8C8D',
    marginTop: 12,
  },
  noBadgesSubtext: {
    fontSize: 14,
    color: '#BDC3C7',
    textAlign: 'center',
    marginTop: 4,
  },
  actionsSection: {
    marginBottom: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#2C3E50',
    marginTop: 8,
    fontWeight: '500',
  },
  tipsSection: {
    marginBottom: 32,
  },
  tipsList: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#2C3E50',
    marginLeft: 12,
  },
});
