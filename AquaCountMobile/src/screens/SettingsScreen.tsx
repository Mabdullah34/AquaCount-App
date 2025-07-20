import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import FunnyBuddy from '../components/FunnyBuddy';
import PremiumBuddy from '../components/PremiumBuddy';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

interface Props {
  navigation: SettingsScreenNavigationProp;
  route: { params: { user: any } };
  user: any;
  onUpdateUser: (user: any) => void;
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}

export default function SettingsScreen({ navigation, user, onUpdateUser, theme, onThemeChange }: Props) {
  const [settings, setSettings] = useState({
    theme: theme,
    sounds: user?.settings?.sounds || true,
    animations: user?.settings?.animations || true,
  });

  const isPremium = user?.subscription?.plan !== 'free';

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updatedUser = {
      ...user,
      settings: settings,
    };
    onUpdateUser(updatedUser);
    onThemeChange(settings.theme);
    navigation.goBack();
  };

  const handleThemeToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newTheme = settings.theme === 'light' ? 'dark' : 'light';
    setSettings({ ...settings, theme: newTheme });
  };

  const handleSoundsToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSettings({ ...settings, sounds: !settings.sounds });
  };

  const handleAnimationsToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSettings({ ...settings, animations: !settings.animations });
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
            <Text style={[styles.title, { color: themeColors.text }]}>Settings</Text>
          </View>

          {/* Buddy */}
          <View style={styles.buddyContainer}>
            {isPremium ? (
              <PremiumBuddy size="large" expression="wink" activity="floating" waterLevel={60} isDraggable={false} />
            ) : (
              <FunnyBuddy size="large" expression="wink" activity="floating" waterLevel={60} />
            )}
          </View>

          {/* Appearance Settings */}
          <View style={[styles.card, { backgroundColor: themeColors.card }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="color-palette" size={20} color="#3B82F6" />
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Appearance</Text>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: themeColors.text }]}>Theme</Text>
                <Text style={[styles.settingDescription, { color: themeColors.text }]}>Choose your preferred theme</Text>
              </View>
              <TouchableOpacity
                style={[styles.themeToggle, { backgroundColor: settings.theme === 'dark' ? '#3B82F6' : '#E5E7EB' }]}
                onPress={handleThemeToggle}
              >
                <View style={[
                  styles.themeToggleThumb,
                  { transform: [{ translateX: settings.theme === 'dark' ? 20 : 0 }] }
                ]}>
                  <Ionicons 
                    name={settings.theme === 'dark' ? 'moon' : 'sunny'} 
                    size={16} 
                    color={settings.theme === 'dark' ? '#FFFFFF' : '#1F2937'} 
                  />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: themeColors.text }]}>Buddy Animations</Text>
                <Text style={[styles.settingDescription, { color: themeColors.text }]}>Enable buddy animations</Text>
              </View>
              <Switch
                value={settings.animations}
                onValueChange={handleAnimationsToggle}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor={settings.animations ? '#FFFFFF' : '#F3F4F6'}
              />
            </View>
          </View>

          {/* Audio Settings */}
          <View style={[styles.card, { backgroundColor: themeColors.card }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="volume-high" size={20} color="#3B82F6" />
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Audio</Text>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: themeColors.text }]}>Sound Effects</Text>
                <Text style={[styles.settingDescription, { color: themeColors.text }]}>Play sounds for interactions</Text>
              </View>
              <Switch
                value={settings.sounds}
                onValueChange={handleSoundsToggle}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor={settings.sounds ? '#FFFFFF' : '#F3F4F6'}
              />
            </View>
          </View>

          {/* App Info */}
          <View style={[styles.card, { backgroundColor: themeColors.card }]}>
            <Text style={[styles.appVersion, { color: themeColors.text }]}>AquaCount v1.0.0</Text>
            <Text style={[styles.appDescription, { color: themeColors.text }]}>Made with 💧 for your health</Text>
          </View>

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
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  themeToggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 2,
    justifyContent: 'center',
  },
  themeToggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  appVersion: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
  appDescription: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.5,
    marginTop: 4,
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