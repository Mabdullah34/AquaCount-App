import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import FunnyBuddy from '../components/FunnyBuddy';
import PremiumBuddy from '../components/PremiumBuddy';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';

type NotificationSettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'NotificationSettings'>;

interface Props {
  navigation: NotificationSettingsScreenNavigationProp;
  route: { params: { user: any } };
  user: any;
  onUpdateUser: (user: any) => void;
  theme: 'light' | 'dark';
}

export default function NotificationSettingsScreen({ navigation, user, onUpdateUser, theme }: Props) {
  const [settings, setSettings] = useState({
    enabled: user?.notificationSettings?.enabled || false,
    frequency: user?.notificationSettings?.frequency || '60',
    startTime: user?.notificationSettings?.startTime || '08:00',
    endTime: user?.notificationSettings?.endTime || '22:00',
    sound: user?.notificationSettings?.sound || true,
    motivationalMessages: user?.notificationSettings?.motivationalMessages || true,
  });

  const isPremium = user?.subscription?.plan !== 'free';

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updatedUser = {
      ...user,
      notificationSettings: settings,
    };
    onUpdateUser(updatedUser);
    navigation.goBack();
  };

  const handleToggleNotifications = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (!settings.enabled) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings to receive reminders.',
          [{ text: 'OK' }]
        );
        return;
      }
    }
    
    setSettings({ ...settings, enabled: !settings.enabled });
  };

  const frequencyOptions = [
    { value: '30', label: 'Every 30 minutes' },
    { value: '60', label: 'Every hour' },
    { value: '90', label: 'Every 1.5 hours' },
    { value: '120', label: 'Every 2 hours' },
    { value: '180', label: 'Every 3 hours' },
  ];

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
            <Text style={[styles.title, { color: themeColors.text }]}>Notifications</Text>
          </View>

          {/* Buddy */}
          <View style={styles.buddyContainer}>
            {isPremium ? (
              <PremiumBuddy size="large" expression="wink" activity="dancing" waterLevel={65} isDraggable={false} />
            ) : (
              <FunnyBuddy size="large" expression="wink" activity="dancing" waterLevel={65} />
            )}
          </View>

          {/* Enable Notifications */}
          <View style={[styles.card, { backgroundColor: themeColors.card }]}>
            <View style={styles.settingItem}>
              <View style={styles.settingHeader}>
                <Ionicons name="notifications" size={20} color="#3B82F6" />
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingLabel, { color: themeColors.text }]}>Enable Reminders</Text>
                  <Text style={[styles.settingDescription, { color: themeColors.text }]}>
                    Get notified to drink water throughout the day
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.enabled}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor={settings.enabled ? '#FFFFFF' : '#F3F4F6'}
              />
            </View>
          </View>

          {settings.enabled && (
            <>
              {/* Frequency */}
              <View style={[styles.card, { backgroundColor: themeColors.card }]}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="time" size={20} color="#3B82F6" />
                  <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Reminder Frequency</Text>
                </View>
                
                {frequencyOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.frequencyOption,
                      settings.frequency === option.value && styles.selectedOption
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSettings({ ...settings, frequency: option.value });
                    }}
                  >
                    <Text style={[
                      styles.frequencyText,
                      { color: themeColors.text },
                      settings.frequency === option.value && styles.selectedText
                    ]}>
                      {option.label}
                    </Text>
                    {settings.frequency === option.value && (
                      <Ionicons name="checkmark" size={20} color="#3B82F6" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Active Hours */}
              <View style={[styles.card, { backgroundColor: themeColors.card }]}>
                <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Active Hours</Text>
                <Text style={[styles.sectionDescription, { color: themeColors.text }]}>
                  Notifications will be OFF during these hours
                </Text>
                
                <View style={styles.timeRow}>
                  <View style={styles.timeInput}>
                    <Text style={[styles.timeLabel, { color: themeColors.text }]}>Start Time (OFF)</Text>
                    <TouchableOpacity style={[styles.timeButton, { borderColor: themeColors.text }]}>
                      <Text style={[styles.timeText, { color: themeColors.text }]}>{settings.startTime}</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.timeInput}>
                    <Text style={[styles.timeLabel, { color: themeColors.text }]}>End Time (OFF)</Text>
                    <TouchableOpacity style={[styles.timeButton, { borderColor: themeColors.text }]}>
                      <Text style={[styles.timeText, { color: themeColors.text }]}>{settings.endTime}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </>
          )}

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Settings</Text>
          </TouchableOpacity>
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
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingInfo: {
    marginLeft: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  sectionDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
  },
  frequencyOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: '#EFF6FF',
  },
  frequencyText: {
    fontSize: 16,
  },
  selectedText: {
    fontWeight: '600',
    color: '#2563EB',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeInput: {
    flex: 1,
    marginHorizontal: 8,
  },
  timeLabel: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 8,
  },
  timeButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
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