import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';
import { Platform } from 'react-native';

const EXPO_PUBLIC_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface CareerInfo {
  title: string;
  description: string;
  keySkills: string[];
  icon: string;
  color: string;
}

const CAREER_INFO: { [key: string]: CareerInfo } = {
  'Web Developer': {
    title: 'Web Developer',
    description: 'Create amazing websites and web applications using modern technologies.',
    keySkills: ['HTML/CSS', 'JavaScript', 'React', 'Node.js', 'Databases'],
    icon: 'globe',
    color: '#007AFF'
  },
  'Flutter Developer': {
    title: 'Flutter Developer',
    description: 'Build beautiful cross-platform mobile apps with Flutter and Dart.',
    keySkills: ['Dart', 'Flutter', 'Mobile UI/UX', 'State Management', 'APIs'],
    icon: 'phone-portrait',
    color: '#02569B'
  },
  'Data Scientist': {
    title: 'Data Scientist',
    description: 'Analyze data and build AI models to solve complex business problems.',
    keySkills: ['Python', 'Machine Learning', 'Statistics', 'SQL', 'Data Visualization'],
    icon: 'analytics',
    color: '#FF9500'
  },
  'Cybersecurity Specialist': {
    title: 'Cybersecurity Specialist',
    description: 'Protect systems and data from cyber threats and security breaches.',
    keySkills: ['Network Security', 'Ethical Hacking', 'Risk Assessment', 'Compliance', 'Incident Response'],
    icon: 'shield-checkmark',
    color: '#FF3B30'
  },
  'Entrepreneur': {
    title: 'Entrepreneur',
    description: 'Lead product development and bring innovative ideas to market.',
    keySkills: ['Product Management', 'Business Strategy', 'Leadership', 'Market Research', 'Communication'],
    icon: 'business',
    color: '#34C759'
  }
};

export default function Recommendation() {
  const { 
    userId, 
    recommendedCareer, 
    roadmapUrl, 
    pointsEarned, 
    totalPoints, 
    level 
  } = useLocalSearchParams();

  const [showRoadmap, setShowRoadmap] = useState(false);
  const [addingPoints, setAddingPoints] = useState(false);

  const careerInfo = CAREER_INFO[recommendedCareer as string] || CAREER_INFO['Web Developer'];

  const openRoadmapExternal = async () => {
    try {
      const supported = await Linking.canOpenURL(roadmapUrl as string);
      if (supported) {
        await Linking.openURL(roadmapUrl as string);
        // Add exploration points
        addExplorationPoints();
      } else {
        Alert.alert('Error', 'Cannot open roadmap URL');
      }
    } catch (error) {
      console.error('Error opening URL:', error);
      Alert.alert('Error', 'Failed to open roadmap');
    }
  };

  const viewRoadmapInApp = () => {
    // On web platform, open external link directly since WebView doesn't work
    if (Platform.OS === 'web') {
      openRoadmapExternal();
    } else {
      setShowRoadmap(true);
      addExplorationPoints();
    }
  };

  const addExplorationPoints = async () => {
    if (addingPoints) return;
    setAddingPoints(true);
    
    try {
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/users/${userId}/add-points?points=20`, {
        method: 'POST',
      });
      
      if (response.ok) {
        Alert.alert('Points Earned!', 'You earned 20 XP for exploring your recommended career path!');
      }
    } catch (error) {
      console.error('Error adding points:', error);
    } finally {
      setAddingPoints(false);
    }
  };

  const navigateToDashboard = () => {
    router.push({
      pathname: '/dashboard',
      params: { userId: userId as string }
    });
  };

  const retakeQuiz = () => {
    router.push({
      pathname: '/quiz',
      params: { userId: userId as string }
    });
  };

  if (showRoadmap) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.webViewHeader}>
          <TouchableOpacity onPress={() => setShowRoadmap(false)} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.webViewTitle}>Career Roadmap</Text>
          <TouchableOpacity onPress={openRoadmapExternal} style={styles.externalButton}>
            <Ionicons name="open-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
        <WebView 
          source={{ uri: roadmapUrl as string }}
          style={styles.webView}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.webViewLoading}>
              <Text>Loading roadmap...</Text>
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
        <Text style={styles.headerTitle}>Career Recommendation</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Congratulations Section */}
        <View style={styles.congratsSection}>
          <View style={styles.congratsIcon}>
            <Ionicons name="trophy" size={48} color="#FFD700" />
          </View>
          <Text style={styles.congratsTitle}>Congratulations!</Text>
          <Text style={styles.congratsSubtitle}>
            You've completed the career assessment quiz
          </Text>
          
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>+{pointsEarned}</Text>
              <Text style={styles.statLabel}>XP Earned</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{totalPoints}</Text>
              <Text style={styles.statLabel}>Total XP</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>Level {level}</Text>
              <Text style={styles.statLabel}>Current Level</Text>
            </View>
          </View>
        </View>

        {/* Recommended Career Section */}
        <View style={styles.careerSection}>
          <Text style={styles.sectionTitle}>Your Recommended Career Path</Text>
          
          <View style={[styles.careerCard, { borderLeftColor: careerInfo.color }]}>
            <View style={styles.careerHeader}>
              <View style={[styles.careerIconContainer, { backgroundColor: careerInfo.color }]}>
                <Ionicons name={careerInfo.icon as any} size={32} color="white" />
              </View>
              <View style={styles.careerInfo}>
                <Text style={styles.careerTitle}>{careerInfo.title}</Text>
                <Text style={styles.careerDescription}>{careerInfo.description}</Text>
              </View>
            </View>
            
            {/* Key Skills */}
            <View style={styles.skillsSection}>
              <Text style={styles.skillsTitle}>Key Skills to Develop:</Text>
              <View style={styles.skillsContainer}>
                {careerInfo.keySkills.map((skill, index) => (
                  <View key={index} style={[styles.skillTag, { borderColor: careerInfo.color }]}>
                    <Text style={[styles.skillText, { color: careerInfo.color }]}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Roadmap Section */}
        <View style={styles.roadmapSection}>
          <Text style={styles.sectionTitle}>Your Learning Path</Text>
          
          <View style={styles.roadmapCard}>
            <Ionicons name="map" size={32} color="#34C759" />
            <Text style={styles.roadmapTitle}>Interactive Career Roadmap</Text>
            <Text style={styles.roadmapDescription}>
              Follow a comprehensive, step-by-step learning path curated by industry experts.
            </Text>
            
            <View style={styles.roadmapActions}>
              <TouchableOpacity style={styles.roadmapButton} onPress={viewRoadmapInApp}>
                <Text style={styles.roadmapButtonText}>View in App</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.roadmapButton, styles.secondaryButton]} 
                onPress={openRoadmapExternal}
              >
                <Text style={[styles.roadmapButtonText, styles.secondaryButtonText]}>
                  Open in Browser
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Next Steps Section */}
        <View style={styles.nextStepsSection}>
          <Text style={styles.sectionTitle}>What's Next?</Text>
          
          <View style={styles.nextStepsList}>
            <View style={styles.nextStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Study the Roadmap</Text>
                <Text style={styles.stepDescription}>
                  Explore the recommended learning path and understand the skills required
                </Text>
              </View>
            </View>
            
            <View style={styles.nextStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Start Learning</Text>
                <Text style={styles.stepDescription}>
                  Begin with the fundamentals and work your way up through each milestone
                </Text>
              </View>
            </View>
            
            <View style={styles.nextStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Practice & Build</Text>
                <Text style={styles.stepDescription}>
                  Apply your knowledge by building projects and gaining hands-on experience
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.primaryAction} onPress={navigateToDashboard}>
            <Ionicons name="stats-chart" size={20} color="white" />
            <Text style={styles.primaryActionText}>View Dashboard</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryAction} onPress={retakeQuiz}>
            <Ionicons name="refresh" size={20} color="#007AFF" />
            <Text style={styles.secondaryActionText}>Retake Quiz</Text>
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
  congratsSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  congratsIcon: {
    marginBottom: 16,
  },
  congratsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  congratsSubtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 32,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 4,
  },
  careerSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  careerCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  careerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  careerIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  careerInfo: {
    flex: 1,
  },
  careerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  careerDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
  skillsSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingTop: 16,
  },
  skillsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  skillText: {
    fontSize: 12,
    fontWeight: '500',
  },
  roadmapSection: {
    marginBottom: 20,
  },
  roadmapCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roadmapTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 12,
    marginBottom: 8,
  },
  roadmapDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  roadmapActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  roadmapButton: {
    flex: 1,
    backgroundColor: '#34C759',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#34C759',
  },
  roadmapButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#34C759',
  },
  nextStepsSection: {
    marginBottom: 20,
  },
  nextStepsList: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nextStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
  actionsSection: {
    gap: 12,
    marginBottom: 32,
  },
  primaryAction: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryActionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryAction: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    gap: 8,
  },
  secondaryActionText: {
    color: '#007AFF',
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
});
