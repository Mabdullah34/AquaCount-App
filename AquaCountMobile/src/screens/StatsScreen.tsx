import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import FunnyBuddy from '../components/FunnyBuddy';
import PremiumBuddy from '../components/PremiumBuddy';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import * as Haptics from 'expo-haptics';

type StatsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Stats'>;

interface Props {
  navigation: StatsScreenNavigationProp;
  route: { params: { user: any } };
  user: any;
  theme: 'light' | 'dark';
}

const screenWidth = Dimensions.get('window').width;

export default function StatsScreen({ navigation, user, theme }: Props) {
  const isPremium = user?.subscription?.plan !== 'free';
  const waterHistory = user?.waterHistory || [];

  // Calculate real user statistics
  const getWeeklyData = () => {
    const last7Days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayData = waterHistory.find((day: any) => day.date === dateStr);
      const dayName = date.toLocaleDateString('en', { weekday: 'short' });

      last7Days.push({
        day: dayName,
        glasses: dayData?.glasses || 0,
        target: dayData?.target || user?.dailyTarget || 8,
        date: dateStr,
      });
    }

    return last7Days;
  };

  const getMonthlyData = () => {
    const thisMonth = waterHistory.filter((day: any) => {
      const dayDate = new Date(day.date);
      const now = new Date();
      return dayDate.getMonth() === now.getMonth() && dayDate.getFullYear() === now.getFullYear();
    });

    const totalGlasses = thisMonth.reduce((sum: number, day: any) => sum + day.glasses, 0);
    const perfectDays = thisMonth.filter((day: any) => day.glasses >= day.target).length;
    const currentStreak = calculateCurrentStreak();
    const bestStreak = calculateBestStreak();

    return { totalGlasses, perfectDays, currentStreak, bestStreak };
  };

  const calculateCurrentStreak = () => {
    let streak = 0;
    const sortedHistory = [...waterHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    for (const day of sortedHistory) {
      if (day.glasses >= day.target) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const calculateBestStreak = () => {
    let bestStreak = 0;
    let currentStreak = 0;
    const sortedHistory = [...waterHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    for (const day of sortedHistory) {
      if (day.glasses >= day.target) {
        currentStreak++;
        bestStreak = Math.max(bestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    return bestStreak;
  };

  const weeklyData = getWeeklyData();
  const monthlyData = getMonthlyData();
  const totalGlasses = weeklyData.reduce((sum, day) => sum + day.glasses, 0);
  const averageDaily = totalGlasses > 0 ? Math.round(totalGlasses / 7) : 0;
  const successRate = weeklyData.length > 0 ? Math.round((weeklyData.filter((day) => day.glasses >= day.target).length / 7) * 100) : 0;

  const themeColors = theme === 'dark' 
    ? { background: ['#1F2937', '#1E3A8A', '#1E40AF'], text: '#FFFFFF', card: '#374151' }
    : { background: ['#FFFFFF', '#EFF6FF', '#DBEAFE'], text: '#1E40AF', card: '#FFFFFF' };

  const chartConfig = {
    backgroundColor: themeColors.card,
    backgroundGradientFrom: themeColors.card,
    backgroundGradientTo: themeColors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
    labelColor: (opacity = 1) => theme === 'dark' ? `rgba(255, 255, 255, ${opacity})` : `rgba(30, 64, 175, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#2563EB',
    },
  };

  const chartData = {
    labels: weeklyData.map(day => day.day),
    datasets: [
      {
        data: weeklyData.map(day => day.glasses),
        color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
        strokeWidth: 2,
      },
      {
        data: weeklyData.map(day => day.target),
        color: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
        strokeWidth: 2,
        withDots: false,
      },
    ],
  };

  return (
    <LinearGradient colors={themeColors.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={themeColors.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: themeColors.text }]}>Your Progress</Text>
          </View>

          {/* Buddy */}
          <View style={styles.buddyContainer}>
            {isPremium ? (
              <PremiumBuddy size="large" expression="excited" activity="celebrating" waterLevel={75} isDraggable={false} />
            ) : (
              <FunnyBuddy size="large" expression="excited" activity="celebrating" waterLevel={75} />
            )}
          </View>

          {/* Weekly Overview */}
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: themeColors.card }]}>
              <Ionicons name="water" size={24} color="#3B82F6" style={styles.statIcon} />
              <Text style={styles.statValue}>{totalGlasses}</Text>
              <Text style={[styles.statLabel, { color: themeColors.text }]}>This Week</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: themeColors.card }]}>
              <Ionicons name="trending-up" size={24} color="#3B82F6" style={styles.statIcon} />
              <Text style={styles.statValue}>{averageDaily}</Text>
              <Text style={[styles.statLabel, { color: themeColors.text }]}>Daily Avg</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: themeColors.card }]}>
              <Ionicons name="calendar" size={24} color="#3B82F6" style={styles.statIcon} />
              <Text style={styles.statValue}>{successRate}%</Text>
              <Text style={[styles.statLabel, { color: themeColors.text }]}>Success Rate</Text>
            </View>
          </View>

          {/* Weekly Chart */}
          <View style={[styles.card, { backgroundColor: themeColors.card }]}>
            <Text style={[styles.cardTitle, { color: themeColors.text }]}>Weekly Progress</Text>
            <LineChart
              data={chartData}
              width={screenWidth - 80}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </View>

          {/* Monthly Stats */}
          <View style={[styles.card, { backgroundColor: themeColors.card }]}>
            <Text style={[styles.cardTitle, { color: themeColors.text }]}>Monthly Overview</Text>
            <View style={styles.monthlyGrid}>
              <View style={styles.monthlyItem}>
                <Text style={styles.monthlyValue}>{monthlyData.totalGlasses}</Text>
                <Text style={[styles.monthlyLabel, { color: themeColors.text }]}>Total Glasses</Text>
              </View>
              <View style={styles.monthlyItem}>
                <Text style={styles.monthlyValue}>{monthlyData.perfectDays}</Text>
                <Text style={[styles.monthlyLabel, { color: themeColors.text }]}>Perfect Days</Text>
              </View>
              <View style={styles.monthlyItem}>
                <Text style={styles.monthlyValue}>{monthlyData.currentStreak}</Text>
                <Text style={[styles.monthlyLabel, { color: themeColors.text }]}>Current Streak</Text>
              </View>
              <View style={styles.monthlyItem}>
                <Text style={styles.monthlyValue}>{monthlyData.bestStreak}</Text>
                <Text style={[styles.monthlyLabel, { color: themeColors.text }]}>Best Streak</Text>
              </View>
            </View>
          </View>

          {/* Motivational Message */}
          {waterHistory.length === 0 && (
            <View style={[styles.card, { backgroundColor: themeColors.card }]}>
              <Text style={[styles.cardTitle, { color: themeColors.text }]}>Start Your Journey!</Text>
              <Text style={[styles.motivationalText, { color: themeColors.text }]}>
                Begin tracking your water intake to see your progress here.
              </Text>
            </View>
          )}
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
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  monthlyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  monthlyItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthlyValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 4,
  },
  monthlyLabel: {
    fontSize: 14,
    opacity: 0.8,
  },
  motivationalText: {
    fontSize: 14,
    opacity: 0.8,
    textAlign: 'center',
  },
});