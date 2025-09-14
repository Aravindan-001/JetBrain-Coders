import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Alert,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';
import { Platform } from 'react-native';

const EXPO_PUBLIC_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface Roadmap {
  id: string;
  skill_role: string;
  roadmap_url: string;
  description: string;
}

interface CareerInfo {
  title: string;
  description: string;
  keySkills: string[];
  icon: string;
  color: string;
  difficulty: string;
  timeToMaster: string;
}

const CAREER_DETAILS: { [key: string]: CareerInfo } = {
  'Web Developer': {
    title: 'Web Developer',
    description: 'Create stunning websites and web applications using modern frameworks and technologies.',
    keySkills: ['HTML/CSS', 'JavaScript', 'React', 'Node.js', 'Databases'],
    icon: 'globe',
    color: '#007AFF',
    difficulty: 'Beginner to Intermediate',
    timeToMaster: '6-12 months'
  },
  'Flutter Developer': {
    title: 'Flutter Developer',
    description: 'Build beautiful cross-platform mobile applications for iOS and Android.',
    keySkills: ['Dart', 'Flutter', 'Mobile UI/UX', 'State Management', 'APIs'],
    icon: 'phone-portrait',
    color: '#02569B',
    difficulty: 'Intermediate',
    timeToMaster: '8-15 months'
  },
  'Data Scientist': {
    title: 'Data Scientist',
    description: 'Analyze complex data and build AI models to solve real-world problems.',
    keySkills: ['Python', 'Machine Learning', 'Statistics', 'SQL', 'Data Visualization'],
    icon: 'analytics',
    color: '#FF9500',
    difficulty: 'Intermediate to Advanced',
    timeToMaster: '12-24 months'
  },
  'Cybersecurity Specialist': {
    title: 'Cybersecurity Specialist',
    description: 'Protect organizations from cyber threats and ensure digital security.',
    keySkills: ['Network Security', 'Ethical Hacking', 'Risk Assessment', 'Compliance', 'Incident Response'],
    icon: 'shield-checkmark',
    color: '#FF3B30',
    difficulty: 'Intermediate to Advanced',
    timeToMaster: '12-18 months'
  },
  'Entrepreneur': {
    title: 'Entrepreneur',
    description: 'Lead product development and bring innovative business ideas to market.',
    keySkills: ['Product Management', 'Business Strategy', 'Leadership', 'Market Research', 'Communication'],
    icon: 'business',
    color: '#34C759',
    difficulty: 'All Levels',
    timeToMaster: 'Ongoing Journey'
  }
};

export default function Roadmaps() {
  const { userId } = useLocalSearchParams();
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null);
  const [showWebView, setShowWebView] = useState(false);

  useEffect(() => {
    loadRoadmaps();
  }, []);

  const loadRoadmaps = async () => {
    try {
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/roadmaps`);
      if (response.ok) {
        const data = await response.json();
        setRoadmaps(data);
      } else {
        Alert.alert('Error', 'Failed to load roadmaps');
      }
    } catch (error) {
      console.error('Error loading roadmaps:', error);
      Alert.alert('Error', 'Failed to load roadmaps');
    } finally {
      setLoading(false);
    }
  };

  const addExplorationPoints = async () => {
    try {
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/users/${userId}/add-points?points=20`, {
        method: 'POST',
      });
      
      if (response.ok) {
        Alert.alert('Points Earned!', 'You earned 20 XP for exploring a career roadmap!');
      }
    } catch (error) {
      console.error('Error adding points:', error);
    }
  };

  const openRoadmapInApp = (roadmap: Roadmap) => {
    // On web platform, open external link directly since WebView doesn't work
    if (Platform.OS === 'web') {
      openRoadmapExternal(roadmap);
    } else {
      setSelectedRoadmap(roadmap);
      setShowWebView(true);
      addExplorationPoints();
    }
  };

  const openRoadmapExternal = async (roadmap: Roadmap) => {
    try {
      const supported = await Linking.canOpenURL(roadmap.roadmap_url);
      if (supported) {
        await Linking.openURL(roadmap.roadmap_url);
        addExplorationPoints();
      } else {
        Alert.alert('Error', 'Cannot open roadmap URL');
      }
    } catch (error) {
      console.error('Error opening URL:', error);
      Alert.alert('Error', 'Failed to open roadmap');
    }
  };

  const getDifficultyColor = (difficulty: string): string => {
    if (difficulty.includes('Beginner')) return '#34C759';
    if (difficulty.includes('Intermediate')) return '#FF9500';
    if (difficulty.includes('Advanced')) return '#FF3B30';
    return '#007AFF';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading career roadmaps...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (showWebView && selectedRoadmap) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.webViewHeader}>
          <TouchableOpacity onPress={() => setShowWebView(false)} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.webViewTitle}>{selectedRoadmap.skill_role} Roadmap</Text>
          <TouchableOpacity 
            onPress={() => openRoadmapExternal(selectedRoadmap)} 
            style={styles.externalButton}
          >
            <Ionicons name="open-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
        <WebView 
          source={{ uri: selectedRoadmap.roadmap_url }}
          style={styles.webView}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.webViewLoading}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.webViewLoadingText}>Loading roadmap...</Text>
            </View>
          )}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Career Roadmaps</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Introduction */}
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>Explore Career Paths</Text>
          <Text style={styles.introSubtitle}>
            Discover comprehensive learning roadmaps for different tech careers. 
            Each roadmap is curated by industry experts to guide your learning journey.
          </Text>
        </View>

        {/* Roadmaps List */}
        <View style={styles.roadmapsSection}>
          <Text style={styles.sectionTitle}>Available Roadmaps</Text>
          
          {roadmaps.map((roadmap) => {
            const careerInfo = CAREER_DETAILS[roadmap.skill_role] || CAREER_DETAILS['Web Developer'];
            
            return (
              <View key={roadmap.id} style={styles.roadmapCard}>
                {/* Header */}
                <View style={styles.roadmapHeader}>
                  <View style={[styles.roadmapIconContainer, { backgroundColor: careerInfo.color }]}>
                    <Ionicons name={careerInfo.icon as any} size={28} color="white" />
                  </View>
                  <View style={styles.roadmapInfo}>
                    <Text style={styles.roadmapTitle}>{careerInfo.title}</Text>
                    <Text style={styles.roadmapDescription}>{careerInfo.description}</Text>
                  </View>
                </View>

                {/* Details */}
                <View style={styles.roadmapDetails}>
                  <View style={styles.detailsRow}>
                    <View style={styles.detailItem}>
                      <Ionicons name="barbell" size={16} color="#7F8C8D" />
                      <Text style={styles.detailText}>{careerInfo.difficulty}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Ionicons name="time" size={16} color="#7F8C8D" />
                      <Text style={styles.detailText}>{careerInfo.timeToMaster}</Text>
                    </View>
                  </View>
                  
                  <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(careerInfo.difficulty) + '20' }]}>
                    <Text style={[styles.difficultyText, { color: getDifficultyColor(careerInfo.difficulty) }]}>
                      {careerInfo.difficulty}
                    </Text>
                  </View>
                </View>

                {/* Skills */}
                <View style={styles.skillsSection}>
                  <Text style={styles.skillsTitle}>Key Skills:</Text>
                  <View style={styles.skillsContainer}>
                    {careerInfo.keySkills.slice(0, 3).map((skill, index) => (
                      <View key={index} style={[styles.skillTag, { borderColor: careerInfo.color }]}>
                        <Text style={[styles.skillText, { color: careerInfo.color }]}>{skill}</Text>
                      </View>
                    ))}
                    {careerInfo.keySkills.length > 3 && (
                      <View style={styles.moreSkills}>
                        <Text style={styles.moreSkillsText}>+{careerInfo.keySkills.length - 3} more</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Actions */}
                <View style={styles.roadmapActions}>
                  <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: careerInfo.color }]}
                    onPress={() => openRoadmapInApp(roadmap)}
                  >
                    <Ionicons name="eye" size={18} color="white" />
                    <Text style={styles.actionButtonText}>
                      {Platform.OS === 'web' ? 'Open Roadmap' : 'View in App'}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.secondaryActionButton, { borderColor: careerInfo.color }]}
                    onPress={() => openRoadmapExternal(roadmap)}
                  >
                    <Ionicons name="open-outline" size={18} color={careerInfo.color} />
                    <Text style={[styles.actionButtonText, { color: careerInfo.color }]}>
                      {Platform.OS === 'web' ? 'New Tab' : 'Open External'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Learning Tips</Text>
          <View style={styles.tipsList}>
            <View style={styles.tip}>
              <Ionicons name="bulb" size={20} color="#FFD700" />
              <Text style={styles.tipText}>Start with fundamentals before moving to advanced topics</Text>
            </View>
            <View style={styles.tip}>
              <Ionicons name="hammer" size={20} color="#FF9500" />
              <Text style={styles.tipText}>Build projects to practice what you learn</Text>
            </View>
            <View style={styles.tip}>
              <Ionicons name="people" size={20} color="#34C759" />
              <Text style={styles.tipText}>Join communities and connect with other learners</Text>
            </View>
            <View style={styles.tip}>
              <Ionicons name="trophy" size={20} color="#FF6B6B" />
              <Text style={styles.tipText}>Set milestones and celebrate your progress</Text>
            </View>
          </View>
        </View>

        {/* Call to Action */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Not sure which path to choose?</Text>
          <Text style={styles.ctaSubtitle}>Take our career quiz to get personalized recommendations!</Text>
          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={() => router.push({
              pathname: '/quiz',
              params: { userId: userId as string }
            })}
          >
            <Ionicons name="help-circle" size={20} color="white" />
            <Text style={styles.ctaButtonText}>Take Career Quiz</Text>
          </TouchableOpacity>
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  introSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  introSubtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    lineHeight: 24,
  },
  roadmapsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  roadmapCard: {
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
  roadmapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  roadmapIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  roadmapInfo: {
    flex: 1,
  },
  roadmapTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  roadmapDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
  roadmapDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F2F6',
  },
  detailsRow: {
    flex: 1,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#7F8C8D',
    marginLeft: 6,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  skillsSection: {
    marginBottom: 16,
  },
  skillsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  skillTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  skillText: {
    fontSize: 10,
    fontWeight: '500',
  },
  moreSkills: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F1F2F6',
  },
  moreSkillsText: {
    fontSize: 10,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  roadmapActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  secondaryActionButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  tipsSection: {
    marginBottom: 20,
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
    flex: 1,
    lineHeight: 20,
  },
  ctaSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  ctaButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  ctaButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  webViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  webViewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  externalButton: {
    padding: 8,
  },
  webView: {
    flex: 1,
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  webViewLoadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#7F8C8D',
  },
});
