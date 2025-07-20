import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
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

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

interface Props {
  navigation: ProfileScreenNavigationProp;
  route: { params: { user: any } };
  user: any;
  onUpdateUser: (user: any) => void;
  theme: 'light' | 'dark';
  onLogout: () => void;
}

export default function ProfileScreen({ navigation, user, onUpdateUser, theme, onLogout }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user || {});

  const isPremium = user?.subscription?.plan !== 'free';

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onUpdateUser(formData);
    setIsEditing(false);
  };

  const handleEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!isPremium) {
      Alert.alert('Premium Required', 'Upgrade to Premium to edit your profile!');
      return;
    }
    setIsEditing(!isEditing);
  };

  const handleLogoutPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: onLogout },
      ]
    );
  };

  // Get user's achievements/badges
  const getUserBadges = () => {
    const waterHistory = user?.waterHistory || [];
    const badges = [];

    // First Drop badge
    if (waterHistory.length > 0) {
      badges.push({ name: 'First Drop', icon: '💧', description: 'Logged first glass' });
    }

    // Daily Goal badge
    const hasReachedGoal = waterHistory.some((day: any) => day.glasses >= day.target);
    if (hasReachedGoal) {
      badges.push({ name: 'Daily Goal', icon: '🎯', description: 'Reached daily goal' });
    }

    // Week Warrior badge
    const last7Days = waterHistory.slice(-7);
    const weekSuccess = last7Days.length === 7 && last7Days.every((day: any) => day.glasses >= day.target);
    if (weekSuccess) {
      badges.push({ name: 'Week Warrior', icon: '🏆', description: '7 days perfect streak' });
    }

    return badges;
  };

  const themeColors = theme === 'dark' 
    ? { background: ['#1F2937', '#1E3A8A', '#1E40AF'], text: '#FFFFFF', card: '#374151' }
    : { background: ['#FFFFFF', '#EFF6FF', '#DBEAFE'], text: '#1E40AF', card: '#FFFFFF' };

  const userBadges = getUserBadges();

  return (
    <LinearGradient colors={themeColors.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={themeColors.text} />
            </TouchableOpacity>
            <View style={styles.headerTitle}>
              <Text style={[styles.title, { color: themeColors.text }]}>Profile</Text>
              {isPremium && <Ionicons name="diamond" size={24} color="#F59E0B" />}
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
                <Ionicons name="create" size={16} color={themeColors.text} />
                <Text style={[styles.editButtonText, { color: themeColors.text }]}>
                  {isEditing ? 'Cancel' : isPremium ? 'Edit' : 'Premium Only'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLogoutPress} style={styles.logoutButton}>
                <Text style={styles.logoutButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Buddy */}
          <View style={styles.buddyContainer}>
            {isPremium ? (
              <PremiumBuddy size="large" expression="happy" activity="floating" waterLevel={85} isDraggable={false} />
            ) : (
              <FunnyBuddy size="large" expression="happy" activity="floating" waterLevel={85} />
            )}
          </View>

          {/* User Badges */}
          {userBadges.length > 0 && (
            <View style={[styles.card, { backgroundColor: themeColors.card }]}>
              <Text style={[styles.cardTitle, { color: themeColors.text }]}>Your Badges</Text>
              <View style={styles.badgesGrid}>
                {userBadges.map((badge, index) => (
                  <View key={index} style={styles.badge}>
                    <Text style={styles.badgeIcon}>{badge.icon}</Text>
                    <Text style={[styles.badgeName, { color: themeColors.text }]}>{badge.name}</Text>
                    <Text style={[styles.badgeDescription, { color: themeColors.text }]}>{badge.description}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Profile Stats */}
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: themeColors.card }]}>
              <Text style={styles.statValue}>{formData.dailyTarget || 8}</Text>
              <Text style={[styles.statLabel, { color: themeColors.text }]}>Daily Target</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: themeColors.card }]}>
              <Text style={styles.statValue}>{user?.waterHistory?.length || 0}</Text>
              <Text style={[styles.statLabel, { color: themeColors.text }]}>Days Active</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: themeColors.card }]}>
              <Text style={styles.statValue}>{userBadges.length}</Text>
              <Text style={[styles.statLabel, { color: themeColors.text }]}>Badges</Text>
            </View>
          </View>

          {/* Profile Information */}
          <View style={[styles.card, { backgroundColor: themeColors.card }]}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: themeColors.text }]}>Name</Text>
              <TextInput
                style={[styles.input, { color: themeColors.text, borderColor: theme === 'dark' ? '#374151' : '#BFDBFE' }]}
                value={formData.name || ''}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                editable={isEditing}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: themeColors.text }]}>Email</Text>
              <TextInput
                style={[styles.input, { color: themeColors.text, borderColor: theme === 'dark' ? '#374151' : '#BFDBFE' }]}
                value={formData.email || ''}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                editable={isEditing}
                keyboardType="email-address"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.smallInput]}>
                <Text style={[styles.inputLabel, { color: themeColors.text }]}>Age</Text>
                <TextInput
                  style={[styles.input, { color: themeColors.text, borderColor: theme === 'dark' ? '#374151' : '#BFDBFE' }]}
                  value={formData.age || ''}
                  onChangeText={(text) => setFormData({ ...formData, age: text })}
                  editable={isEditing}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputGroup, styles.smallInput]}>
                <Text style={[styles.inputLabel, { color: themeColors.text }]}>Weight (kg)</Text>
                <TextInput
                  style={[styles.input, { color: themeColors.text, borderColor: theme === 'dark' ? '#374151' : '#BFDBFE' }]}
                  value={formData.weight || ''}
                  onChangeText={(text) => setFormData({ ...formData, weight: text })}
                  editable={isEditing}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputGroup, styles.smallInput]}>
                <Text style={[styles.inputLabel, { color: themeColors.text }]}>Height (cm)</Text>
                <TextInput
                  style={[styles.input, { color: themeColors.text, borderColor: theme === 'dark' ? '#374151' : '#BFDBFE' }]}
                  value={formData.height || ''}
                  onChangeText={(text) => setFormData({ ...formData, height: text })}
                  editable={isEditing}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: themeColors.text }]}>City</Text>
              <TextInput
                style={[styles.input, { color: themeColors.text, borderColor: theme === 'dark' ? '#374151' : '#BFDBFE' }]}
                value={formData.city || ''}
                onChangeText={(text) => setFormData({ ...formData, city: text })}
                editable={isEditing}
              />
            </View>
          </View>

          {isEditing && (
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  editButtonText: {
    marginLeft: 4,
    fontSize: 14,
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  buddyContainer: {
    alignItems: 'center',
    marginBottom: 32,
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
  badgesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  badge: {
    alignItems: 'center',
    flex: 1,
  },
  badgeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
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
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  smallInput: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});