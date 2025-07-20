import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import FunnyBuddy from '../components/FunnyBuddy';
import PremiumBuddy from '../components/PremiumBuddy';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

type DashboardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Dashboard'>;

interface Props {
  navigation: DashboardScreenNavigationProp;
  user: any;
  onUpdateUser: (user: any) => void;
  theme: 'light' | 'dark';
}

export default function DashboardScreen({ navigation, user, onUpdateUser, theme }: Props) {
  const [waterIntake, setWaterIntake] = useState(0);
  const [weather, setWeather] = useState({ temp: 25, condition: 'Sunny' });
  const [showOverhydrationWarning, setShowOverhydrationWarning] = useState(false);

  const isPremium = user?.subscription?.plan !== 'free';

  // Initialize waterIntake from user.waterHistory for the current day
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayEntry = user?.waterHistory?.find((day: any) => day.date === today);
    setWaterIntake(todayEntry?.glasses || 0);
  }, [user?.waterHistory]);

  // Calculate daily target with weather and disease adjustments for premium
  const getDailyTarget = () => {
    let target = user?.dailyTarget || 8;

    if (isPremium) {
      // Weather adjustment for premium users
      if (weather.temp > 30) {
        target += 1;
      } else if (weather.temp < 0) {
        target = Math.max(1, target - 2);
      }

      // Disease adjustments for premium users
      const moreWaterConditions = [
        'fever',
        'diarrhea',
        'vomiting',
        'kidney_stones',
        'uti',
        'constipation',
        'heat_stroke',
      ];
      if (moreWaterConditions.includes(user?.disease)) {
        target += 1;
      }

      const restrictedConditions = ['kidney_failure', 'heart_failure', 'cirrhosis', 'hyponatremia', 'siadh'];
      if (restrictedConditions.includes(user?.disease)) {
        target = Math.min(target, 6);
      }
    }

    return target;
  };

  const addWater = (glasses: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const actualGlasses = Math.min(glasses, 2);
    const newIntake = waterIntake + actualGlasses;
    setWaterIntake(newIntake);

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentHour = now.getHours();
    const isEveningLog = currentHour >= 21;

    const updatedHistory = JSON.parse(JSON.stringify(user.waterHistory || []));
    const currentDailyTarget = getDailyTarget();

    const todayIndex = updatedHistory.findIndex((day: any) => day.date === today);

    if (todayIndex >= 0) {
      updatedHistory[todayIndex] = {
        date: today,
        glasses: newIntake,
        target: currentDailyTarget,
        timestamp: now.toISOString(),
        eveningLog: updatedHistory[todayIndex].eveningLog || isEveningLog,
      };
    } else {
      updatedHistory.push({
        date: today,
        glasses: newIntake,
        target: currentDailyTarget,
        timestamp: now.toISOString(),
        eveningLog: isEveningLog,
      });
    }

    let updatedLoggedCities = user.loggedCities || [];
    if (user.city && !updatedLoggedCities.includes(user.city)) {
      updatedLoggedCities = [...updatedLoggedCities, user.city];
    }

    const newHasDoubleUpped = actualGlasses === 2 ? true : user.hasDoubleUpped;

    onUpdateUser({
      ...user,
      waterHistory: updatedHistory,
      loggedCities: updatedLoggedCities,
      hasDoubleUpped: newHasDoubleUpped,
    });

    // Logic for warning message
    if (newIntake > currentDailyTarget) {
      setShowOverhydrationWarning(true);
      setTimeout(() => setShowOverhydrationWarning(false), 5000);
    }

    if (newIntake >= currentDailyTarget) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const removeWater = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (waterIntake > 0) {
      const newIntake = waterIntake - 1;
      setWaterIntake(newIntake);

      const now = new Date();
      const today = now.toISOString().split('T')[0];

      const updatedHistory = JSON.parse(JSON.stringify(user.waterHistory || []));
      const todayIndex = updatedHistory.findIndex((day: any) => day.date === today);

      const currentDailyTarget = getDailyTarget();

      if (todayIndex >= 0) {
        updatedHistory[todayIndex] = {
          ...updatedHistory[todayIndex],
          glasses: newIntake,
          target: currentDailyTarget,
          timestamp: now.toISOString(),
        };
      } else {
        updatedHistory.push({
          date: today,
          glasses: newIntake,
          target: currentDailyTarget,
          timestamp: now.toISOString(),
          eveningLog: false,
        });
      }

      onUpdateUser({
        ...user,
        waterHistory: updatedHistory,
      });

      if (newIntake <= currentDailyTarget) {
        setShowOverhydrationWarning(false);
      }
    }
  };

  const getProgressPercentage = () => {
    return Math.min((waterIntake / getDailyTarget()) * 100, 100);
  };

  const getBuddyActivity = () => {
    if (waterIntake >= getDailyTarget()) return 'celebrating';
    if (waterIntake > getDailyTarget() * 0.7) return 'dancing';
    if (waterIntake > getDailyTarget() * 0.3) return 'floating';
    return 'idle';
  };

  const getBuddyExpression = () => {
    if (waterIntake >= getDailyTarget()) return 'love';
    if (waterIntake > getDailyTarget() * 0.7) return 'excited';
    if (waterIntake > getDailyTarget() * 0.3) return 'happy';
    return 'thirsty';
  };

  const handlePlayWithBuddy = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('BuddyGame', { user });
  };

  const themeColors = theme === 'dark' 
    ? { background: ['#1F2937', '#1E3A8A', '#1E40AF'], text: '#FFFFFF', card: '#374151' }
    : { background: ['#FFFFFF', '#EFF6FF', '#DBEAFE'], text: '#1E40AF', card: '#FFFFFF' };

  return (
    <LinearGradient colors={themeColors.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.greeting, { color: themeColors.text }]}>Good morning,</Text>
              <Text style={[styles.name, { color: themeColors.text }]}>{user?.name || 'User'}</Text>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => navigation.navigate('Profile', { user })}
              >
                <Ionicons name="person" size={24} color={themeColors.text} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => navigation.navigate('Stats', { user })}
              >
                <Ionicons name="bar-chart" size={24} color={themeColors.text} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => navigation.navigate('Achievements', { user })}
              >
                <Ionicons name="trophy" size={24} color={themeColors.text} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => navigation.navigate('NotificationSettings', { user })}
              >
                <Ionicons name="notifications" size={24} color={themeColors.text} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => navigation.navigate('Settings', { user })}
              >
                <Ionicons name="settings" size={24} color={themeColors.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Premium/Trial Status */}
          {!isPremium && (
            <View style={[styles.card, { backgroundColor: themeColors.card }]}>
              <View style={styles.premiumCard}>
                <View>
                  <Text style={[styles.cardTitle, { color: themeColors.text }]}>Free Trial</Text>
                  <Text style={[styles.cardSubtitle, { color: themeColors.text }]}>Limited features available</Text>
                </View>
                <TouchableOpacity
                  style={styles.upgradeButton}
                  onPress={() => navigation.navigate('Upgrade', { user })}
                >
                  <Ionicons name="diamond" size={16} color="white" />
                  <Text style={styles.upgradeButtonText}>Upgrade</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Water Intake Card */}
          <View style={[styles.card, { backgroundColor: themeColors.card }]}>
            <View style={styles.waterIntakeHeader}>
              <View>
                <Text style={[styles.cardTitle, { color: themeColors.text }]}>Water Intake</Text>
                <Text style={[styles.cardSubtitle, { color: themeColors.text }]}>
                  {waterIntake} / {getDailyTarget()} glasses
                </Text>
              </View>

              {/* Buddy */}
              <View style={styles.buddyContainer}>
                {isPremium ? (
                  <PremiumBuddy
                    size="medium"
                    expression={getBuddyExpression()}
                    activity={getBuddyActivity()}
                    waterLevel={getProgressPercentage()}
                    isDraggable={true}
                  />
                ) : (
                  <FunnyBuddy
                    size="medium"
                    expression={getBuddyExpression()}
                    activity={getBuddyActivity()}
                    waterLevel={getProgressPercentage()}
                    isDraggable={true}
                  />
                )}
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { backgroundColor: theme === 'dark' ? '#374151' : '#DBEAFE' }]}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${getProgressPercentage()}%` }
                  ]}
                />
              </View>
            </View>

            {/* Water Controls */}
            <View style={styles.waterControls}>
              <TouchableOpacity
                onPress={removeWater}
                disabled={waterIntake === 0}
                style={[styles.controlButton, styles.removeButton, waterIntake === 0 && styles.disabledButton]}
              >
                <Ionicons name="remove" size={20} color="white" />
              </TouchableOpacity>

              <View style={styles.addButtons}>
                <TouchableOpacity onPress={() => addWater(1)} style={styles.addButton}>
                  <Text style={styles.addButtonText}>+1 Glass</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => addWater(2)} style={[styles.addButton, styles.addTwoButton]}>
                  <Text style={styles.addButtonText}>+2 Glasses</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Quick Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: themeColors.card }]}>
              <Text style={styles.statValue}>{Math.round(getProgressPercentage())}%</Text>
              <Text style={[styles.statLabel, { color: themeColors.text }]}>Daily Goal</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: themeColors.card }]}>
              <Text style={styles.statValue}>{user?.waterHistory?.length || 0}</Text>
              <Text style={[styles.statLabel, { color: themeColors.text }]}>Days Tracked</Text>
            </View>
          </View>

          {/* Play with Buddy Button */}
          <TouchableOpacity style={styles.playButton} onPress={handlePlayWithBuddy}>
            <Ionicons name="game-controller" size={20} color="white" />
            <Text style={styles.playButtonText}>Play with Buddy!</Text>
          </TouchableOpacity>

          {/* Weather Card - Premium Only */}
          {isPremium && (
            <View style={[styles.card, { backgroundColor: themeColors.card }]}>
              <View style={styles.weatherCard}>
                <View>
                  <Text style={[styles.cardTitle, { color: themeColors.text }]}>Weather</Text>
                  <Text style={[styles.cardSubtitle, { color: themeColors.text }]}>{user?.city || 'Your City'}</Text>
                </View>
                <View style={styles.weatherInfo}>
                  <Text style={styles.temperature}>{weather.temp}°C</Text>
                  <Text style={[styles.condition, { color: themeColors.text }]}>{weather.condition}</Text>
                </View>
              </View>
              {weather.temp > 30 && (
                <Text style={styles.weatherWarning}>
                  🌡️ Hot weather detected! +1 glass added to your daily target
                </Text>
              )}
              {weather.temp < 0 && (
                <Text style={styles.coldWarning}>
                  🥶 Freezing weather detected! -2 glasses from your daily target
                </Text>
              )}
            </View>
          )}
        </ScrollView>

        {/* Achievement Message */}
        {waterIntake >= getDailyTarget() && !showOverhydrationWarning && (
          <View style={styles.achievementMessage}>
            <Text style={styles.achievementText}>🎉 Daily goal achieved! Great job!</Text>
          </View>
        )}

        {/* Overhydration Warning Message */}
        {showOverhydrationWarning && (
          <View style={styles.warningMessage}>
            <Text style={styles.warningText}>⚠️ Warning: Excessive water intake can be dangerous for your health!</Text>
          </View>
        )}
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
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 8,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  premiumCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    opacity: 0.8,
  },
  upgradeButton: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  upgradeButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 4,
  },
  waterIntakeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  buddyContainer: {
    alignItems: 'center',
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  waterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  removeButton: {
    backgroundColor: '#EF4444',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  addButtons: {
    flexDirection: 'row',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  addTwoButton: {
    backgroundColor: '#1D4ED8',
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.8,
  },
  playButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  playButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  weatherCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weatherInfo: {
    alignItems: 'flex-end',
  },
  temperature: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  condition: {
    fontSize: 14,
    opacity: 0.8,
  },
  weatherWarning: {
    color: '#EA580C',
    fontSize: 14,
    marginTop: 8,
  },
  coldWarning: {
    color: '#3B82F6',
    fontSize: 14,
    marginTop: 8,
  },
  achievementMessage: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: 'center',
  },
  achievementText: {
    color: 'white',
    fontWeight: '600',
  },
  warningMessage: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: 'center',
  },
  warningText: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
});