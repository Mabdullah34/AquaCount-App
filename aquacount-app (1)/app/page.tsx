"use client"

import { useState, useEffect } from "react"
import { WelcomeScreen } from "@/components/welcome-screen"
import { AuthScreen } from "@/components/auth-screen"
import { Dashboard } from "@/components/dashboard"
import { ProfileScreen } from "@/components/profile-screen"
import { StatsScreen } from "@/components/stats-screen"
import { AchievementsScreen } from "@/components/achievements-screen"
import { SettingsScreen } from "@/components/settings-screen"
import { NotificationSettings } from "@/components/notification-settings"
import { UpgradeScreen } from "@/components/upgrade-screen"
import { BuddyGameScreen } from "@/components/buddy-game-screen"

export default function AquaCountApp() {
  const [currentScreen, setCurrentScreen] = useState<
    | "welcome"
    | "auth"
    | "dashboard"
    | "profile"
    | "stats"
    | "achievements"
    | "settings"
    | "notifications"
    | "upgrade"
    | "buddyGame"
  >("welcome")
  const [user, setUser] = useState<any>(null)
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  // authMode is no longer needed as there's only one auth flow (Google)

  // Mock auth state management for preview
  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setIsLoadingUser(false)
    }, 1000)
  }, [])

  const handleGetStarted = () => {
    setCurrentScreen("auth") // Directly go to auth screen for Google Sign-In
  }

  const handleGoToLogin = () => {
    setCurrentScreen("auth") // Directly go to auth screen for Google Sign-In
  }

  const handleLogin = async (userData: any) => {
    try {
      // Mock user data for preview
      const mockUserData = {
        uid: "mock-uid-123",
        name: userData.name || "Demo User",
        email: userData.email || "demo@example.com",
        age: userData.age || "25",
        weight: userData.weight || "70",
        height: userData.height || "170",
        activityLevel: userData.activityLevel || "moderate",
        goal: userData.goal || "none",
        disease: userData.disease || "none",
        city: userData.city || "New York",
        subscription: {
          plan: "free",
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        dailyTarget: 8,
        waterHistory: [
          {
            date: new Date().toISOString().split("T")[0],
            glasses: 3,
            target: 8,
            timestamp: new Date().toISOString(),
            eveningLog: false,
          },
        ],
        joinDate: new Date().toISOString(),
        notificationSettings: {
          enabled: false,
          frequency: "60",
          startTime: "08:00",
          endTime: "22:00",
          sound: true,
          motivationalMessages: true,
        },
        settings: {
          theme: "light",
          sounds: true,
          animations: true,
          units: "metric",
        },
        hasDoubleUpped: false,
        loggedCities: ["New York"],
        authProvider: "google", // Always Google now
      }

      setUser(mockUserData)
      setTheme(mockUserData.settings?.theme || "light")
      setCurrentScreen("dashboard")
    } catch (error) {
      console.error("Error setting user data:", error)
      alert("Failed to set up user session. Please try again.")
    }
  }

  const handleBack = () => {
    if (
      currentScreen === "notifications" ||
      currentScreen === "profile" ||
      currentScreen === "stats" ||
      currentScreen === "achievements" ||
      currentScreen === "settings" ||
      currentScreen === "upgrade"
    ) {
      if (user?.dataDeleted && currentScreen === "upgrade") {
        return
      }
      setCurrentScreen("dashboard")
    } else {
      setCurrentScreen("welcome")
    }
  }

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen as any)
  }

  const handleUpdateUser = async (updatedUser: any) => {
    try {
      // Mock update for preview
      setUser(updatedUser)
      console.log("Mock user update:", updatedUser)
    } catch (error) {
      console.error("Error updating user data:", error)
      alert("Failed to save changes. Please try again.")
    }
  }

  const handleUpgrade = async (plan: string) => {
    const now = new Date()
    let endDate: Date

    if (plan === "monthly") {
      endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    } else if (plan === "yearly") {
      endDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
    } else if (plan === "lifetime") {
      endDate = new Date(now.getTime() + 100 * 365 * 24 * 60 * 60 * 1000)
    } else {
      endDate = now
    }

    const updatedUser = {
      ...user,
      subscription: {
        plan: plan,
        startDate: now.toISOString(),
        endDate: endDate.toISOString(),
      },
      dataDeleted: false,
    }
    await handleUpdateUser(updatedUser)
    setCurrentScreen("dashboard")
  }

  const handleLogout = async () => {
    try {
      setUser(null)
      setCurrentScreen("welcome")
    } catch (error) {
      console.error("Error during logout:", error)
      alert("Failed to log out. Please try again.")
    }
  }

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme)
  }

  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 text-blue-900">
        <p className="text-lg font-semibold">Loading AquaCount...</p>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-gray-900" : "bg-white"}`}>
      <div className="max-w-md mx-auto min-h-screen shadow-xl">
        {currentScreen === "welcome" && <WelcomeScreen onGetStarted={handleGetStarted} onGoToLogin={handleGoToLogin} />}
        {currentScreen === "auth" && <AuthScreen onLogin={handleLogin} onBack={handleBack} />}
        {currentScreen === "dashboard" && user && (
          <Dashboard user={user} onNavigate={handleNavigate} onUpdateUser={handleUpdateUser} theme={theme} />
        )}
        {currentScreen === "profile" && user && (
          <ProfileScreen
            user={user}
            onBack={handleBack}
            onUpdateUser={handleUpdateUser}
            theme={theme}
            onLogout={handleLogout}
          />
        )}
        {currentScreen === "stats" && user && <StatsScreen user={user} onBack={handleBack} theme={theme} />}
        {currentScreen === "achievements" && user && (
          <AchievementsScreen user={user} onBack={handleBack} theme={theme} />
        )}
        {currentScreen === "settings" && user && (
          <SettingsScreen
            user={user}
            onBack={handleBack}
            onUpdateUser={handleUpdateUser}
            theme={theme}
            onThemeChange={handleThemeChange}
          />
        )}
        {currentScreen === "notifications" && user && (
          <NotificationSettings user={user} onBack={handleBack} onUpdateUser={handleUpdateUser} theme={theme} />
        )}
        {currentScreen === "upgrade" && user && (
          <UpgradeScreen user={user} onBack={handleBack} onUpgrade={handleUpgrade} theme={theme} />
        )}
        {currentScreen === "buddyGame" && user && <BuddyGameScreen user={user} onBack={handleBack} theme={theme} />}
      </div>
    </div>
  )
}
