import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import FunnyBuddy from '../components/FunnyBuddy';
import PremiumBuddy from '../components/PremiumBuddy';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

type AchievementsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Achievements'>;

interface Props {
  navigation: AchievementsScreenNavigationProp;
  route: { params: { user: any } };
  user: any;
  theme: 'light' | 'dark';
}

export default function AchievementsScreen({ navigation, user, theme }: Props) {
  const isPremium = user?.subscription?.plan !== 'free';
  const waterHistory = user?.waterHistory || [];

  // Calculate streaks for achievements
  const calculateStreak = (history: any[], type: 'dailyGoal' | 'eveningLog') => {
    let currentStreak = 0;
    let maxStreak = 0;
    const sortedHistory = [...history].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (isNaN(dateA.getTime())) return 1;
      if (isNaN(dateB.getTime())) return -1;
      return dateA.getTime() - dateB.getTime();
    });

    if (sortedHistory.length === 0) return 0;

    for (let i = 0; i < sortedHistory.length; i++) {
      const day = sortedHistory[i];
      const glasses = Number(day.glasses);
      const target = Number(day.target);

      if (isNaN(glasses) || isNaN(target)) {
        currentStreak = 0;
        continue;
      }

      const meetsCondition = type === 'dailyGoal' ? glasses >= target : day.eveningLog;

      if (meetsCondition) {
        if (i === 0) {
          currentStreak = 1;
        } else {
          const prevDay = sortedHistory[i - 1];
          const dateCurrent = new Date(day.date);
          const datePrev = new Date(prevDay.date);

          if (isNaN(dateCurrent.getTime()) || isNaN(datePrev.getTime())) {
            currentStreak = 1;
            continue;
          }

          datePrev.setDate(datePrev.getDate() + 1);
          if (
            dateCurrent.getFullYear() === datePrev.getFullYear() &&
            dateCurrent.getMonth() === datePrev.getMonth() &&
            dateCurrent.getDate() === datePrev.getDate()
          ) {
            currentStreak++;
          } else {
            currentStreak = 1;
          }
        }
      } else {
        currentStreak = 0;
      }
      maxStreak = Math.max(maxStreak, currentStreak);
    }
    return maxStreak;
  };

  const currentDailyGoalStreak = calculateStreak(waterHistory, 'dailyGoal');
  const nightOwlStreak = calculateStreak(waterHistory, 'eveningLog');

  // Define all achievements
  const achievements = [
    {
      id: 1,
      title: 'First Drop',
      description: 'Log your first glass of water',
      icon: '💧',
      unlocked: waterHistory.length > 0,
      progress: waterHistory.length > 0 ? 100 : 0,
      category: 'beginner',
    },
    {
      id: 2,
      title: 'Daily Goal',
      description: 'Reach your daily water goal',
      icon: '🎯',
      unlocked: waterHistory.some((day: any) => Number(day.glasses) >= Number(day.target)),
      progress: waterHistory.some((day: any) => Number(day.glasses) >= Number(day.target))
        ? 100
        : Math.min(
            waterHistory.reduce(
              (max: number, day: any) => Math.max(max, (Number(day.glasses) / Number(day.target)) * 100),
              0,
            ),
            99,
          ),
      category: 'daily',
    },
    {
      id: 3,
      title: 'Week Warrior',
      description: 'Complete 7 days in a row',
      icon: '🏆',
      unlocked: currentDailyGoalStreak >= 7,
      progress: Math.min((currentDailyGoalStreak / 7) * 100, 99),
      category: 'streak',
    },
    {
      id: 4,
      title: 'Hydration Hero',
      description: 'Drink 100 glasses total',
      icon: '🦸',
      unlocked: waterHistory.reduce((total: number, day: any) => total + Number(day.glasses), 0) >= 100,
      progress: Math.min(
        (waterHistory.reduce((total: number, day: any) => total + Number(day.glasses), 0) / 100) * 100,
        100,
      ),
      category: 'milestone',
    },
    {
      id: 5,
      title: 'Perfect Week',
      description: 'Hit your goal every day for a week',
      icon: '⭐',
      unlocked: currentDailyGoalStreak >= 7,
      progress: Math.min((currentDailyGoalStreak / 7) * 100, 99),
      category: 'streak',
    },
    {
      id: 6,
      title: 'Night Owl',
      description: 'Log a glass of water after 9 PM for 5 days in a row',
      icon: '🌙',
      unlocked: nightOwlStreak >= 5,
      progress: Math.min((nightOwlStreak / 5) * 100, 99),
      category: 'habit',
    },
    {
      id: 7,
      title: 'Double Up',
      description: 'Log two glasses within 10 minutes for the first time',
      icon: '💧💧',
      unlocked: user?.hasDoubleUpped || false,
      progress: user?.hasDoubleUpped ? 100 : 0,
      category: 'beginner',
    },
    {
      id: 8,
      title: 'Hydration Explorer',
      description: 'Log water from 3 different cities',
      icon: '🌍',
      unlocked: (user?.loggedCities?.length || 0) >= 3,
      progress: Math.min(((user?.loggedCities?.length || 0) / 3) * 100, 99),
      category: 'milestone',
    },
  ];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalPoints = unlockedCount * 100;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'beginner':
        return '#10B981';
      case 'daily':
        return '#3B82F6';
      case 'streak':
        return '#F59E0B';
      case 'milestone':
        return '#8B5CF6';
      case 'habit':
        return '#EC4899';
      default:
        return '#6B7280';
    }
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
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={themeColors.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: themeColors.text }]}>Achievements</Text>
          </View>

          {/* Buddy */}
          <View style={styles.buddyContainer}>
            {isPremium ? (
              <PremiumBuddy size="large" expression="love" activity="celebrating" waterLevel={90} isDraggable={false} />
            ) : (
              <FunnyBuddy size="large" expression="love" activity="celebrating" waterLevel={90} />
            )}
          </View>

          {/* Achievement Stats */}
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: themeColors.card }]}>
              <Ionicons name="trophy" size={24} color="#F59E0B" style={styles.statIcon} />
              <Text style={styles.statValue}>{unlockedCount}</Text>
              <Text style={[styles.statLabel, { color: themeColors.text }]}>Unlocked</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: themeColors.card }]}>
              <Ionicons name="star" size={24} color="#3B82F6" style={styles.statIcon} />
              <Text style={styles.statValue}>{totalPoints}</Text>
              <Text style={[styles.statLabel, { color: themeColors.text }]}>Points</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: themeColors.card }]}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" style={styles.statIcon} />
              <Text style={styles.statValue}>{Math.round((unlockedCount / achievements.length) * 100)}%</Text>
              <Text style={[styles.statLabel, { color: themeColors.text }]}>Complete</Text>
            </View>
          </View>

          {/* Achievements List */}
          <View style={styles.achievementsList}>
            {achievements.map((achievement) => (
              <View
                key={achievement.id}
                style={[
                  styles.achievementCard,
                  { backgroundColor: themeColors.card },
                  achievement.unlocked && { borderLeftWidth: 4, borderLeftColor: getCategoryColor(achievement.category) }
                ]}
              >
                <View style={styles.achievementContent}>
                  <View
                    style={[
                      styles.achievementIcon,
                      { backgroundColor: achievement.unlocked ? getCategoryColor(achievement.category) + '20' : '#F3F4F6' }
                    ]}
                  >
                    {achievement.unlocked ? (
                      <Text style={styles.achievementEmoji}>{achievement.icon}</Text>
                    ) : (
                      <Ionicons name="lock-closed" size={24} color="#6B7280" />
                    )}
                  </View>
                  <View style={styles.achievementInfo}>
                    <Text style={[styles.achievementTitle, { color: themeColors.text, opacity: achievement.unlocked ? 1 : 0.6 }]}>
                      {achievement.title}
                    </Text>
                    <Text style={[styles.achievementDescription, { color: themeColors.text, opacity: achievement.unlocked ? 0.8 : 0.5 }]}>
                      {achievement.description}
                    </Text>
                    {!achievement.unlocked && achievement.progress > 0 && (
                      <View style={styles.progressContainer}>
                        <View style={styles.progressTextContainer}>
                          <Text style={[styles.progressText, { color: themeColors.text }]}>Progress</Text>
                          <Text style={[styles.progressText, { color: themeColors.text }]}>{Math.round(achievement.progress)}%</Text>
                        </View>
                        <View style={[styles.progressBar, { backgroundColor: theme === 'dark' ? '#374151' : '#E5E7EB' }]}>
                          <View
                            style={[
                              styles.progressFill,
                              { 
                                width: `${achievement.progress}%`,
                                backgroundColor: getCategoryColor(achievement.category)
                              }
                            ]}
                          />
                        </View>
                      </View>
                    )}
                  </View>
                  {achievement.unlocked && (
                    <View style={styles.achievementPoints}>
                      <Ionicons name="flash" size={20} color="#F59E0B" />
                      <Text style={styles.pointsText}>+100</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>

          {/* Motivational Message */}
          <View style={[styles.card, { backgroundColor: themeColors.card }]}>
            <Text style={[styles.cardTitle, { color: themeColors.text }]}>🎯 Keep Going!</Text>
            <Text style={[styles.motivationalText, { color: themeColors.text }]}>
              Complete your daily water goals to unlock more achievements!
            </Text>
          </View>
        </ScrollView>
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
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  buddyContainer: {
    alignItems: 'center',
    marginBottom: 32,
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
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statIcon: {
    marginBottom: 8,
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
  achievementsList: {
    marginBottom: 24,
  },
  achievementCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  achievementContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  achievementEmoji: {
    fontSize: 24,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressText: {
    fontSize: 12,
    opacity: 0.6,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  achievementPoints: {
    alignItems: 'center',
  },
  pointsText: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: '600',
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  motivationalText: {
    fontSize: 14,
    opacity: 0.8,
  },
});