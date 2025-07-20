import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import FunnyBuddy from '../components/FunnyBuddy';
import * as Haptics from 'expo-haptics';

type WelcomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Welcome'>;

interface Props {
  navigation: WelcomeScreenNavigationProp;
}

export default function WelcomeScreen({ navigation }: Props) {
  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Auth');
  };

  const handleGoToLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Auth');
  };

  return (
    <LinearGradient
      colors={['#FFFFFF', '#EFF6FF', '#DBEAFE']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.buddyContainer}>
            <FunnyBuddy 
              size="large" 
              expression="excited" 
              activity="dancing" 
              waterLevel={75} 
            />
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.title}>AquaCount</Text>
            <Text style={styles.subtitle}>Build healthy habits with us</Text>
            <Text style={styles.description}>Track your daily water intake and stay hydrated</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
            <Text style={styles.getStartedText}>Get started</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleGoToLogin}>
            <Text style={styles.loginText}>I have an account</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.termsText}>
          By starting or signing in you agree to our Terms of Service
        </Text>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buddyContainer: {
    marginBottom: 32,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1D4ED8',
    marginBottom: 16,
  },
  description: {
    fontSize: 18,
    color: '#2563EB',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 16,
  },
  getStartedButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  getStartedText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  loginText: {
    color: '#2563EB',
    fontSize: 16,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  termsText: {
    fontSize: 12,
    color: '#3B82F6',
    textAlign: 'center',
    marginBottom: 16,
  },
});