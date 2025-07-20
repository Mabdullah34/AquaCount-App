import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

// Import screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import AuthScreen from './src/screens/AuthScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import StatsScreen from './src/screens/StatsScreen';
import AchievementsScreen from './src/screens/AchievementsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import NotificationSettingsScreen from './src/screens/NotificationSettingsScreen';
import UpgradeScreen from './src/screens/UpgradeScreen';
import BuddyGameScreen from './src/screens/BuddyGameScreen';

// Types
export type RootStackParamList = {
  Welcome: undefined;
  Auth: undefined;
  Dashboard: { user: any };
  Profile: { user: any };
  Stats: { user: any };
  Achievements: { user: any };
  Settings: { user: any };
  NotificationSettings: { user: any };
  Upgrade: { user: any };
  BuddyGame: { user: any };
};

const Stack = createStackNavigator<RootStackParamList>();

// Keep splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [appIsReady, setAppIsReady] = useState(false);

  const [fontsLoaded] = useFonts({
    // Add custom fonts if needed
  });

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = React.useCallback(async () => {
    if (appIsReady && fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady, fontsLoaded]);

  if (!appIsReady || !fontsLoaded) {
    return null;
  }

  const handleLogin = (userData: any) => {
    setUser(userData);
  };

  const handleUpdateUser = (updatedUser: any) => {
    setUser(updatedUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
  };

  return (
    <NavigationContainer onReady={onLayoutRootView}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
        }}
        initialRouteName={user ? 'Dashboard' : 'Welcome'}
      >
        {!user ? (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Auth">
              {(props) => (
                <AuthScreen
                  {...props}
                  onLogin={handleLogin}
                />
              )}
            </Stack.Screen>
          </>
        ) : (
          <>
            <Stack.Screen name="Dashboard">
              {(props) => (
                <DashboardScreen
                  {...props}
                  user={user}
                  onUpdateUser={handleUpdateUser}
                  theme={theme}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Profile">
              {(props) => (
                <ProfileScreen
                  {...props}
                  user={user}
                  onUpdateUser={handleUpdateUser}
                  theme={theme}
                  onLogout={handleLogout}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Stats">
              {(props) => (
                <StatsScreen
                  {...props}
                  user={user}
                  theme={theme}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Achievements">
              {(props) => (
                <AchievementsScreen
                  {...props}
                  user={user}
                  theme={theme}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Settings">
              {(props) => (
                <SettingsScreen
                  {...props}
                  user={user}
                  onUpdateUser={handleUpdateUser}
                  theme={theme}
                  onThemeChange={handleThemeChange}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="NotificationSettings">
              {(props) => (
                <NotificationSettingsScreen
                  {...props}
                  user={user}
                  onUpdateUser={handleUpdateUser}
                  theme={theme}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Upgrade">
              {(props) => (
                <UpgradeScreen
                  {...props}
                  user={user}
                  theme={theme}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="BuddyGame">
              {(props) => (
                <BuddyGameScreen
                  {...props}
                  user={user}
                  theme={theme}
                />
              )}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}