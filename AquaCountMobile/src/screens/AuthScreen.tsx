import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  Alert 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import FunnyBuddy from '../components/FunnyBuddy';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

type AuthScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Auth'>;

interface Props {
  navigation: AuthScreenNavigationProp;
  onLogin: (userData: any) => void;
}

// Water calculation logic
function calculateWaterRecommendation(
  weightKg: number,
  age: number,
  activityLevel: string,
  goal: string,
  diseaseOrCondition: string,
  temperatureC = 25,
) {
  let dailyGlasses = (weightKg * 35) / 250;

  if (activityLevel === 'active') dailyGlasses += 2;
  else if (activityLevel === 'moderate') dailyGlasses += 1;

  if (goal === 'fitness' || goal === 'skin') dailyGlasses += 1;

  if (temperatureC > 30) dailyGlasses += 1;
  else if (temperatureC < 0) dailyGlasses = Math.max(1, dailyGlasses - 2);

  const moreWaterConditions = ['fever', 'diarrhea', 'vomiting', 'kidney_stones', 'uti', 'constipation', 'heat_stroke'];
  if (moreWaterConditions.includes(diseaseOrCondition)) {
    dailyGlasses += 1;
  }

  const restrictedConditions = ['kidney_failure', 'heart_failure', 'cirrhosis', 'hyponatremia', 'siadh'];
  if (restrictedConditions.includes(diseaseOrCondition)) {
    dailyGlasses = Math.min(dailyGlasses, 6);
  }

  if (dailyGlasses < 4) dailyGlasses = 4;
  if (dailyGlasses > 15) dailyGlasses = 15;

  return Math.round(dailyGlasses);
}

export default function AuthScreen({ navigation, onLogin }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    weight: '',
    height: '',
    activityLevel: '',
    goal: '',
    disease: '',
    city: '',
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      // Simulate Google sign-in
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate new user vs existing user
      const isNewUser = Math.random() > 0.5;
      
      if (isNewUser) {
        setFormData({
          ...formData,
          name: 'New Google User',
          email: 'new.google.user@example.com',
        });
        setShowAdditionalInfo(true);
      } else {
        const mockExistingUser = {
          uid: 'mock-existing-uid',
          name: 'Existing Google User',
          email: 'existing.google.user@example.com',
          age: '30',
          weight: '75',
          height: '175',
          activityLevel: 'active',
          goal: 'fitness',
          disease: 'none',
          city: 'London',
          subscription: {
            plan: 'free',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
          dailyTarget: 10,
          waterHistory: [
            {
              date: new Date().toISOString().split('T')[0],
              glasses: 5,
              target: 10,
              timestamp: new Date().toISOString(),
              eveningLog: false,
            },
          ],
          joinDate: new Date().toISOString(),
          notificationSettings: {
            enabled: true,
            frequency: '60',
            startTime: '08:00',
            endTime: '22:00',
            sound: true,
            motivationalMessages: true,
          },
          settings: {
            theme: 'light',
            sounds: true,
            animations: true,
            units: 'metric',
          },
          hasDoubleUpped: false,
          loggedCities: ['London'],
          authProvider: 'google',
        };
        onLogin(mockExistingUser);
      }
    } catch (error) {
      Alert.alert('Error', 'This is a preview - Google sign-in is mocked');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProfile = async () => {
    if (!termsAccepted) {
      Alert.alert('Terms Required', 'You must accept the Terms of Service & Privacy Policy to create an account.');
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const dailyTarget = calculateWaterRecommendation(
        parseInt(formData.weight),
        parseInt(formData.age),
        formData.activityLevel,
        formData.goal,
        formData.disease,
        25,
      );

      const newUserProfile = {
        uid: 'mock-google-uid-' + Math.random().toString(36).substring(7),
        name: formData.name,
        email: formData.email,
        age: formData.age,
        weight: formData.weight,
        height: formData.height,
        activityLevel: formData.activityLevel,
        goal: formData.goal,
        disease: formData.disease,
        city: formData.city,
        subscription: {
          plan: 'free',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        dailyTarget,
        waterHistory: [],
        joinDate: new Date().toISOString(),
        notificationSettings: {
          enabled: false,
          frequency: '60',
          startTime: '08:00',
          endTime: '22:00',
          sound: true,
          motivationalMessages: true,
        },
        settings: {
          theme: 'light',
          sounds: true,
          animations: true,
          units: 'metric',
        },
        hasDoubleUpped: false,
        loggedCities: [formData.city],
        authProvider: 'google',
      };

      onLogin(newUserProfile);
    } catch (error) {
      Alert.alert('Error', 'Failed to complete profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (showAdditionalInfo) {
    return (
      <LinearGradient colors={['#FFFFFF', '#EFF6FF', '#DBEAFE']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView style={styles.scrollView}>
            <View style={styles.header}>
              <TouchableOpacity 
                onPress={() => setShowAdditionalInfo(false)}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color="#2563EB" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Complete Your Profile</Text>
            </View>

            <View style={styles.buddyContainer}>
              <FunnyBuddy size="medium" expression="excited" activity="floating" waterLevel={50} />
            </View>

            <Text style={styles.welcomeText}>
              Welcome! Please complete your profile to get personalized water recommendations.
            </Text>

            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />

              <TextInput
                style={[styles.input, styles.disabledInput]}
                placeholder="Your Google email"
                value={formData.email}
                editable={false}
              />

              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.smallInput]}
                  placeholder="Age"
                  value={formData.age}
                  onChangeText={(text) => setFormData({ ...formData, age: text })}
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.input, styles.smallInput]}
                  placeholder="Weight (kg)"
                  value={formData.weight}
                  onChangeText={(text) => setFormData({ ...formData, weight: text })}
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.input, styles.smallInput]}
                  placeholder="Height (cm)"
                  value={formData.height}
                  onChangeText={(text) => setFormData({ ...formData, height: text })}
                  keyboardType="numeric"
                />
              </View>

              <TextInput
                style={styles.input}
                placeholder="City"
                value={formData.city}
                onChangeText={(text) => setFormData({ ...formData, city: text })}
              />

              <View style={styles.checkboxContainer}>
                <TouchableOpacity
                  style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}
                  onPress={() => setTermsAccepted(!termsAccepted)}
                >
                  {termsAccepted && <Ionicons name="checkmark" size={16} color="white" />}
                </TouchableOpacity>
                <Text style={styles.checkboxText}>
                  I accept the Terms of Service & Privacy Policy
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.completeButton, (!termsAccepted || loading) && styles.disabledButton]}
                onPress={handleCompleteProfile}
                disabled={!termsAccepted || loading}
              >
                <Text style={styles.completeButtonText}>
                  {loading ? 'Creating Account...' : 'Complete Registration'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#FFFFFF', '#EFF6FF', '#DBEAFE']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#2563EB" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Join AquaCount</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.buddyContainer}>
            <FunnyBuddy size="medium" expression="happy" activity="floating" waterLevel={30} />
          </View>

          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            <Ionicons name="logo-google" size={20} color="#4285F4" style={styles.googleIcon} />
            <Text style={styles.googleButtonText}>
              {loading ? 'Signing in...' : 'Continue with Google (Preview)'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.signInText}>
            Sign in with your Google account to start your hydration journey.
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 16,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buddyContainer: {
    marginBottom: 24,
  },
  googleButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 16,
  },
  googleIcon: {
    marginRight: 12,
  },
  googleButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  signInText: {
    fontSize: 14,
    color: '#2563EB',
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: '#1D4ED8',
    textAlign: 'center',
    marginBottom: 24,
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    color: '#1E40AF',
  },
  disabledInput: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  smallInput: {
    flex: 1,
    marginRight: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#2563EB',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2563EB',
  },
  checkboxText: {
    fontSize: 14,
    color: '#1E40AF',
    flex: 1,
  },
  completeButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 24,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  completeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});