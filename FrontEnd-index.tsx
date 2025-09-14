import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const EXPO_PUBLIC_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface User {
  id: string;
  name: string;
  email: string;
  points: number;
  level: number;
  badges: string[];
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize backend data
      await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/init-data`, {
        method: 'POST',
      });

      // Create a demo user for now (in a real app, this would be login/signup)
      const demoUser = {
        name: "Career Explorer",
        email: "demo@example.com"
      };

      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(demoUser),
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error initializing app:', error);
      Alert.alert('Error', 'Failed to initialize app. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const navigateToQuiz = () => {
    if (user) {
      router.push({
        pathname: '/quiz',
        params: { userId: user.id }
      });
    }
  };

  const navigateToDashboard = () => {
    if (user) {
      router.push({
        pathname: '/dashboard', 
        params: { userId: user.id }
      });
    }
  };

  const navigateToRoadmaps = () => {
    if (user) {
      router.push({
        pathname: '/roadmaps',
        params: { userId: user.id }
      });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Initializing Career Advisor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>One-Stop Career &</Text>
        <Text style={styles.title}>Education Advisor</Text>
        <Text style={styles.subtitle}>Discover your ideal career path</Text>
        
        {user && (
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Welcome, {user.name}!</Text>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.statText}>{user.points} XP</Text>
              </View>
              <View style={styles.stat}>
                <Ionicons name="trophy" size={16} color="#FF6B6B" />
                <Text style={styles.statText}>Level {user.level}</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]}
          onPress={navigateToQuiz}
        >
          <Ionicons name="help-circle" size={24} color="white" />
          <Text style={styles.buttonText}>Start Quiz</Text>
          <Text style={styles.buttonSubtext}>Discover your strengths</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]}
          onPress={navigateToRoadmaps}
        >
          <Ionicons name="map" size={24} color="white" />
          <Text style={styles.buttonText}>View Roadmaps</Text>
          <Text style={styles.buttonSubtext}>Explore career paths</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.tertiaryButton]}
          onPress={navigateToDashboard}
        >
          <Ionicons name="stats-chart" size={24} color="white" />
          <Text style={styles.buttonText}>Dashboard</Text>
          <Text style={styles.buttonSubtext}>Track your progress</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Take the quiz to get personalized career recommendations
        </Text>
      </View>
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
  header: {
    padding: 24,
    paddingTop: 40,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 8,
  },
  userInfo: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    gap: 20,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  buttonContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    gap: 20,
  },
  button: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  tertiaryButton: {
    backgroundColor: '#FF6B6B',
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  buttonSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 4,
  },
  footer: {
    padding: 24,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
});
