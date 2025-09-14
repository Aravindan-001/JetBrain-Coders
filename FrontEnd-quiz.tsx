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
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

const EXPO_PUBLIC_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface Quiz {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  category: string;
}

interface Answer {
  quiz_id: string;
  selected_option: string;
}

export default function QuizPage() {
  const { userId } = useLocalSearchParams();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/quizzes`);
      if (response.ok) {
        const data = await response.json();
        setQuizzes(data);
      } else {
        Alert.alert('Error', 'Failed to load quiz questions');
      }
    } catch (error) {
      console.error('Error loading quizzes:', error);
      Alert.alert('Error', 'Failed to load quiz questions');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  const handleNext = () => {
    if (!selectedOption) {
      Alert.alert('Please select an answer', 'You must choose an option before proceeding.');
      return;
    }

    // Save the answer
    const currentQuiz = quizzes[currentQuestionIndex];
    const newAnswer: Answer = {
      quiz_id: currentQuiz.id,
      selected_option: selectedOption
    };

    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestionIndex] = newAnswer;
    setAnswers(updatedAnswers);

    // Move to next question or submit
    if (currentQuestionIndex < quizzes.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption('');
    } else {
      submitQuiz(updatedAnswers);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      // Load previous answer if exists
      const prevAnswer = answers[currentQuestionIndex - 1];
      setSelectedOption(prevAnswer ? prevAnswer.selected_option : '');
    }
  };

  const submitQuiz = async (finalAnswers: Answer[]) => {
    setSubmitting(true);
    try {
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/submit-quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          answers: finalAnswers
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setQuizResult(result);
        setShowResult(true);
      } else {
        Alert.alert('Error', 'Failed to submit quiz');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      Alert.alert('Error', 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const navigateToRecommendation = () => {
    router.push({
      pathname: '/recommendation',
      params: { 
        userId: userId as string,
        recommendedCareer: quizResult.recommendation.recommended_career,
        roadmapUrl: quizResult.recommendation.roadmap_url,
        pointsEarned: quizResult.points_earned.toString(),
        totalPoints: quizResult.total_points.toString(),
        level: quizResult.level.toString()
      }
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading quiz questions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (quizzes.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>No quiz questions available</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadQuizzes}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuiz = quizzes[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quizzes.length) * 100;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Career Quiz</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Question {currentQuestionIndex + 1} of {quizzes.length}
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      {/* Question */}
      <ScrollView style={styles.content}>
        <View style={styles.questionContainer}>
          <Text style={styles.question}>{currentQuiz.question}</Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {[
            { key: 'a', text: currentQuiz.option_a },
            { key: 'b', text: currentQuiz.option_b },
            { key: 'c', text: currentQuiz.option_c },
            { key: 'd', text: currentQuiz.option_d }
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.optionButton,
                selectedOption === option.key && styles.selectedOption
              ]}
              onPress={() => handleOptionSelect(option.key)}
            >
              <View style={styles.optionContent}>
                <View style={[
                  styles.optionCircle,
                  selectedOption === option.key && styles.selectedCircle
                ]}>
                  <Text style={[
                    styles.optionLetter,
                    selectedOption === option.key && styles.selectedLetter
                  ]}>
                    {option.key.toUpperCase()}
                  </Text>
                </View>
                <Text style={[
                  styles.optionText,
                  selectedOption === option.key && styles.selectedOptionText
                ]}>
                  {option.text}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        {currentQuestionIndex > 0 && (
          <TouchableOpacity style={styles.previousButton} onPress={handlePrevious}>
            <Text style={styles.previousButtonText}>Previous</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.nextButton, !selectedOption && styles.disabledButton]}
          onPress={handleNext}
          disabled={!selectedOption || submitting}
        >
          {submitting ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.nextButtonText}>
              {currentQuestionIndex === quizzes.length - 1 ? 'Submit' : 'Next'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Result Modal */}
      <Modal visible={showResult} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="checkmark-circle" size={60} color="#34C759" />
            <Text style={styles.modalTitle}>Quiz Completed!</Text>
            <Text style={styles.modalSubtitle}>Great job on finishing the quiz!</Text>
            
            <View style={styles.resultStats}>
              <View style={styles.resultStat}>
                <Text style={styles.resultStatValue}>+{quizResult?.points_earned}</Text>
                <Text style={styles.resultStatLabel}>Points Earned</Text>
              </View>
              <View style={styles.resultStat}>
                <Text style={styles.resultStatValue}>Level {quizResult?.level}</Text>
                <Text style={styles.resultStatLabel}>Current Level</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.viewRecommendationButton}
              onPress={navigateToRecommendation}
            >
              <Text style={styles.viewRecommendationText}>View Recommendation</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  placeholder: {
    width: 40,
  },
  progressContainer: {
    padding: 16,
    backgroundColor: 'white',
  },
  progressText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  questionContainer: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  question: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    lineHeight: 28,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5E5',
  },
  selectedOption: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  optionCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  selectedCircle: {
    backgroundColor: '#007AFF',
  },
  optionLetter: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  selectedLetter: {
    color: 'white',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50',
    lineHeight: 22,
  },
  selectedOptionText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  navigationContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    gap: 12,
  },
  previousButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    alignItems: 'center',
  },
  previousButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#BDC3C7',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 16,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 24,
  },
  resultStats: {
    flexDirection: 'row',
    gap: 32,
    marginBottom: 24,
  },
  resultStat: {
    alignItems: 'center',
  },
  resultStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  resultStatLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 4,
  },
  viewRecommendationButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
  },
  viewRecommendationText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
