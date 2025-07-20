"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Minus, User, Bell, BarChart3, Trophy, Settings, Crown, Sparkles } from "lucide-react"
import { FunnyBuddy } from "@/components/funny-buddy"
import { PremiumBuddy } from "@/components/premium-buddy"
import { useSound } from "@/hooks/use-sound"

interface DashboardProps {
  user: any
  onNavigate: (screen: string) => void
  onUpdateUser: (user: any) => void
  theme: "light" | "dark"
}

// Simulate a weather API call
async function fetchWeather(city: string) {
  // In a real app, this would be an actual API call to a weather service
  // For demonstration, we'll return a simulated temperature and condition
  const temperatures: { [key: string]: number } = {
    "New York": Math.floor(Math.random() * 40) - 5, // -5 to 35
    London: Math.floor(Math.random() * 30) - 10, // -10 to 20
    Tokyo: Math.floor(Math.random() * 35) - 5, // -5 to 30
    Sydney: Math.floor(Math.random() * 30) + 15, // 15 to 45
    Moscow: Math.floor(Math.random() * 30) - 20, // -20 to 10
    Dubai: Math.floor(Math.random() * 20) + 25, // 25 to 45
  }
  const conditions = ["Sunny", "Cloudy", "Rainy", "Snowy", "Partly Cloudy"]

  const temp = temperatures[city] || Math.floor(Math.random() * 40) - 5 // Default random
  const condition = conditions[Math.floor(Math.random() * conditions.length)]

  return new Promise((resolve) =>
    setTimeout(() => {
      resolve({ temp, condition })
    }, 500),
  )
}

export function Dashboard({ user, onNavigate, onUpdateUser, theme }: DashboardProps) {
  const [waterIntake, setWaterIntake] = useState(0)
  const [weather, setWeather] = useState({ temp: 25, condition: "Sunny" })
  const [buddyPosition, setBuddyPosition] = useState({ x: 0, y: 0 })
  const [buddyActivityOverride, setBuddyActivityOverride] = useState<string | null>(null)
  const [buddyExpressionOverride, setBuddyExpressionOverride] = useState<string | null>(null)
  const [showOverhydrationWarning, setShowOverhydrationWarning] = useState(false) // New state for warning
  const { playClickSound, playSuccessSound } = useSound()

  const isPremium = user?.subscription?.plan !== "free"

  // Initialize waterIntake from user.waterHistory for the current day
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]
    const todayEntry = user?.waterHistory?.find((day: any) => day.date === today)
    setWaterIntake(todayEntry?.glasses || 0)
  }, [user?.waterHistory])

  // Fetch weather data for premium users
  useEffect(() => {
    const checkAndFetchWeather = async () => {
      if (isPremium && user?.city) {
        const lastCheck = localStorage.getItem("lastWeatherCheck")
        const now = Date.now()
        const ONE_DAY_MS = 24 * 60 * 60 * 1000

        if (
          !lastCheck ||
          now - Number(lastCheck) > ONE_DAY_MS ||
          user.city !== localStorage.getItem("lastCheckedCity")
        ) {
          const fetchedWeather: any = await fetchWeather(user.city)
          setWeather(fetchedWeather)
          localStorage.setItem("lastWeatherCheck", now.toString())
          localStorage.setItem("lastCheckedCity", user.city)
        } else {
          setWeather({ temp: 25, condition: "Sunny" })
        }
      }
    }
    checkAndFetchWeather()
  }, [user?.city, isPremium])

  // Calculate daily target with weather and disease adjustments for premium
  const getDailyTarget = useCallback(() => {
    let target = user?.dailyTarget || 8

    if (isPremium) {
      // Weather adjustment for premium users
      if (weather.temp > 30) {
        target += 1
      } else if (weather.temp < 0) {
        target = Math.max(1, target - 2)
      }

      // Disease adjustments for premium users
      const moreWaterConditions = [
        "fever",
        "diarrhea",
        "vomiting",
        "kidney_stones",
        "uti",
        "constipation",
        "heat_stroke",
      ]
      if (moreWaterConditions.includes(user?.disease)) {
        target += 1
      }

      const restrictedConditions = ["kidney_failure", "heart_failure", "cirrhosis", "hyponatremia", "siadh"]
      if (restrictedConditions.includes(user?.disease)) {
        target = Math.min(target, 6)
      }
    }

    return target
  }, [user?.dailyTarget, user?.disease, isPremium, weather.temp])

  const addWater = (glasses: number) => {
    playClickSound()

    const actualGlasses = Math.min(glasses, 2)
    const newIntake = waterIntake + actualGlasses
    setWaterIntake(newIntake)

    const now = new Date()
    const today = now.toISOString().split("T")[0]
    const currentHour = now.getHours()
    const isEveningLog = currentHour >= 21

    const updatedHistory = JSON.parse(JSON.stringify(user.waterHistory || []))
    const currentDailyTarget = getDailyTarget()

    const todayIndex = updatedHistory.findIndex((day: any) => day.date === today)

    if (todayIndex >= 0) {
      updatedHistory[todayIndex] = {
        date: today,
        glasses: newIntake,
        target: currentDailyTarget,
        timestamp: now.toISOString(),
        eveningLog: updatedHistory[todayIndex].eveningLog || isEveningLog,
      }
    } else {
      updatedHistory.push({
        date: today,
        glasses: newIntake,
        target: currentDailyTarget,
        timestamp: now.toISOString(),
        eveningLog: isEveningLog,
      })
    }

    let updatedLoggedCities = user.loggedCities || []
    if (user.city && !updatedLoggedCities.includes(user.city)) {
      updatedLoggedCities = [...updatedLoggedCities, user.city]
    }

    const newHasDoubleUpped = actualGlasses === 2 ? true : user.hasDoubleUpped

    onUpdateUser({
      ...user,
      waterHistory: updatedHistory,
      loggedCities: updatedLoggedCities,
      hasDoubleUpped: newHasDoubleUpped,
    })

    // Logic for warning message
    if (newIntake > currentDailyTarget) {
      setShowOverhydrationWarning(true)
    } else {
      setShowOverhydrationWarning(false) // Hide if goal is not exceeded
    }

    if (newIntake >= currentDailyTarget) {
      playSuccessSound()
    }
  }

  // Effect to hide the overhydration warning after a few seconds
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (showOverhydrationWarning) {
      timer = setTimeout(() => {
        setShowOverhydrationWarning(false)
      }, 5000) // Hide after 5 seconds
    }
    return () => clearTimeout(timer)
  }, [showOverhydrationWarning])

  const removeWater = () => {
    playClickSound()
    if (waterIntake > 0) {
      const newIntake = waterIntake - 1
      setWaterIntake(newIntake)

      const now = new Date()
      const today = now.toISOString().split("T")[0]

      const updatedHistory = JSON.parse(JSON.stringify(user.waterHistory || []))
      const todayIndex = updatedHistory.findIndex((day: any) => day.date === today)

      const currentDailyTarget = getDailyTarget()

      if (todayIndex >= 0) {
        updatedHistory[todayIndex] = {
          ...updatedHistory[todayIndex],
          glasses: newIntake,
          target: currentDailyTarget,
          timestamp: now.toISOString(),
        }
      } else {
        updatedHistory.push({
          date: today,
          glasses: newIntake,
          target: currentDailyTarget,
          timestamp: now.toISOString(),
          eveningLog: false,
        })
      }

      onUpdateUser({
        ...user,
        waterHistory: updatedHistory,
      })

      // If water intake drops below target, hide warning
      if (newIntake <= currentDailyTarget) {
        setShowOverhydrationWarning(false)
      }
    }
  }

  const getProgressPercentage = () => {
    return Math.min((waterIntake / getDailyTarget()) * 100, 100)
  }

  const getBuddyActivity = () => {
    if (buddyActivityOverride) return buddyActivityOverride
    if (waterIntake >= getDailyTarget()) return "celebrating"
    if (waterIntake > getDailyTarget() * 0.7) return "dancing"
    if (waterIntake > getDailyTarget() * 0.3) return "floating"
    return "idle"
  }

  const getBuddyExpression = () => {
    if (buddyExpressionOverride) return buddyExpressionOverride
    if (waterIntake >= getDailyTarget()) return "love"
    if (waterIntake > getDailyTarget() * 0.7) return "excited"
    if (waterIntake > getDailyTarget() * 0.3) return "happy"
    return "thirsty"
  }

  const handlePlayWithBuddy = () => {
    playClickSound()
    onNavigate("buddyGame") // Navigate to the new game screen
    // Remove temporary activity/expression overrides as they are no longer needed here
    // setBuddyActivityOverride("dancing")
    // setBuddyExpressionOverride("excited")
    // setTimeout(() => {
    //   setBuddyActivityOverride(null)
    //   setBuddyExpressionOverride(null)
    // }, 1500)
  }

  const handleBuddyClick = () => {
    playClickSound()
  }

  const themeClasses =
    theme === "dark"
      ? "bg-gradient-to-br from-gray-800 via-blue-900 to-blue-800 text-white"
      : "bg-gradient-to-br from-white via-blue-50 to-blue-100 text-blue-900"

  const cardClasses =
    theme === "dark" ? "bg-gray-800/80 border-blue-700 text-white" : "bg-white border-blue-200 text-blue-900"

  return (
    <div className={`min-h-screen p-6 ${themeClasses}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Good morning,</h1>
          <h2 className="text-3xl font-bold">{user?.name || "User"}</h2>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className={theme === "dark" ? "text-white" : "text-blue-600"}
            onClick={() => {
              playClickSound()
              onNavigate("profile")
            }}
          >
            <User className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={theme === "dark" ? "text-white" : "text-blue-600"}
            onClick={() => {
              playClickSound()
              onNavigate("stats")
            }}
          >
            <BarChart3 className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={theme === "dark" ? "text-white" : "text-blue-600"}
            onClick={() => {
              playClickSound()
              onNavigate("achievements")
            }}
          >
            <Trophy className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={theme === "dark" ? "text-white" : "text-blue-600"}
            onClick={() => {
              playClickSound()
              onNavigate("notifications")
            }}
          >
            <Bell className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={theme === "dark" ? "text-white" : "text-blue-600"}
            onClick={() => {
              playClickSound()
              onNavigate("settings")
            }}
          >
            <Settings className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Premium/Trial Status */}
      {!isPremium && (
        <Card className={`${cardClasses} mb-6 shadow-lg`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Free Trial</h3>
                <p className="text-sm opacity-80">Limited features available</p>
              </div>
              <Button
                onClick={() => {
                  playClickSound()
                  onNavigate("upgrade")
                }}
                className="bg-blue-600 text-white"
                size="sm"
              >
                <Crown className="h-4 w-4 mr-2" />
                Upgrade
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Water Intake Card */}
      <Card className={`${cardClasses} mb-6 shadow-lg`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold">Water Intake</h3>
              <p className="opacity-80">
                {waterIntake} / {getDailyTarget()} glasses
              </p>
            </div>

            {/* Premium or Regular Buddy */}
            {isPremium ? (
              <PremiumBuddy
                size="medium"
                expression={getBuddyExpression()}
                activity={getBuddyActivity()}
                waterLevel={getProgressPercentage()}
                isDraggable={true}
                onPositionChange={setBuddyPosition}
                onBuddyClick={handleBuddyClick}
              />
            ) : (
              <FunnyBuddy
                size="medium"
                expression={getBuddyExpression()}
                activity={getBuddyActivity()}
                waterLevel={getProgressPercentage()}
                isDraggable={true}
                onPositionChange={setBuddyPosition}
                onBuddyClick={handleBuddyClick}
              />
            )}
          </div>

          {/* Progress Bar */}
          <div
            className={`w-full ${theme === "dark" ? "bg-gray-700" : "bg-blue-100"} rounded-full h-4 mb-4 overflow-hidden`}
          >
            <div
              className="bg-gradient-to-r from-blue-400 to-blue-600 h-4 rounded-full transition-all duration-1000 relative"
              style={{ width: `${getProgressPercentage()}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>

          {/* Water Controls */}
          <div className="flex items-center justify-center space-x-4">
            <Button
              onClick={removeWater}
              disabled={waterIntake === 0}
              variant="outline"
              size="icon"
              className={`${theme === "dark" ? "border-gray-600 text-white hover:bg-gray-700" : "border-blue-200 text-blue-600 hover:bg-blue-50"} bg-transparent`}
            >
              <Minus className="h-4 w-4" />
            </Button>

            <div className="flex space-x-2">
              <Button onClick={() => addWater(1)} className="bg-blue-500 hover:bg-blue-600 text-white px-6">
                +1 Glass
              </Button>
              <Button onClick={() => addWater(2)} className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                +2 Glasses
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className={`${cardClasses} shadow-lg`}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{Math.round(getProgressPercentage())}%</div>
            <div className="text-sm opacity-80">Daily Goal</div>
          </CardContent>
        </Card>
        <Card className={`${cardClasses} shadow-lg`}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{user?.waterHistory?.length || 0}</div>
            <div className="text-sm opacity-80">Days Tracked</div>
          </CardContent>
        </Card>
      </div>

      {/* Play with Buddy Button */}
      <Button
        onClick={handlePlayWithBuddy}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl text-lg mb-6"
      >
        <Sparkles className="h-5 w-5 mr-2" />
        Play with Buddy!
      </Button>

      {/* Weather Card - Premium Only */}
      {isPremium && (
        <Card className={`${cardClasses} mb-6 shadow-lg`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Weather</h3>
                <p className="opacity-80">{user?.city || "Your City"}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{weather.temp}°C</p>
                <p className="text-sm opacity-80">{weather.condition}</p>
              </div>
            </div>
            {weather.temp > 30 && (
              <p className="text-orange-600 text-sm mt-2">
                🌡️ Hot weather detected! +1 glass added to your daily target
              </p>
            )}
            {weather.temp < 0 && (
              <p className="text-blue-400 text-sm mt-2">
                🥶 Freezing weather detected! -2 glasses from your daily target
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Achievement Message */}
      {waterIntake >= getDailyTarget() && !showOverhydrationWarning && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-full shadow-lg animate-bounce z-50">
          🎉 Daily goal achieved! Great job!
        </div>
      )}

      {/* Overhydration Warning Message */}
      {showOverhydrationWarning && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-full shadow-lg animate-bounce z-50">
          ⚠️ Warning: Excessive water intake can be dangerous for your health!
        </div>
      )}
    </div>
  )
}
