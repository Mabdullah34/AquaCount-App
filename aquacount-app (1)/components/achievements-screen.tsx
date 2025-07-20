"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Trophy, Star, Target, Zap, Lock, ArrowLeft } from "lucide-react"
import { FunnyBuddy } from "@/components/funny-buddy"
import { PremiumBuddy } from "@/components/premium-buddy"
import { useSound } from "@/hooks/use-sound"
import { Button } from "@/components/ui/button"

interface AchievementsScreenProps {
  user: any
  onBack: () => void
  theme: "light" | "dark"
}

export function AchievementsScreen({ user, onBack, theme }: AchievementsScreenProps) {
  const { playClickSound } = useSound()
  const isPremium = user?.subscription?.plan !== "free"
  const waterHistory = user?.waterHistory || []

  // Helper to check if a date is a Saturday or Sunday
  const isWeekend = (dateString: string) => {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return false // Check for invalid date
    const day = date.getDay()
    return day === 0 || day === 6 // 0 for Sunday, 6 for Saturday
  }

  // Helper to check if two dates are in the same calendar week
  const inSameWeek = (date1String: string, date2String: string) => {
    const date1 = new Date(date1String)
    const date2 = new Date(date2String)
    if (isNaN(date1.getTime()) || isNaN(date2.getTime())) return false // Check for invalid dates

    // Set both dates to the start of their respective weeks (e.g., Sunday)
    const startOfWeek1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate() - date1.getDay())
    const startOfWeek2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate() - date2.getDay())

    return startOfWeek1.getTime() === startOfWeek2.getTime()
  }

  // Calculate streaks for achievements
  const calculateStreak = (history: any[], type: "dailyGoal" | "eveningLog") => {
    let currentStreak = 0
    let maxStreak = 0
    // Sort history by date ascending, handling potential invalid dates
    const sortedHistory = [...history].sort((a, b) => {
      const dateA = new Date(a.date)
      const dateB = new Date(b.date)
      if (isNaN(dateA.getTime())) return 1 // Push invalid dates to end
      if (isNaN(dateB.getTime())) return -1 // Push invalid dates to end
      return dateA.getTime() - dateB.getTime()
    })

    if (sortedHistory.length === 0) return 0

    for (let i = 0; i < sortedHistory.length; i++) {
      const day = sortedHistory[i]
      // Ensure glasses and target are numbers
      const glasses = Number(day.glasses)
      const target = Number(day.target)

      // Skip if data is invalid for the current day
      if (isNaN(glasses) || isNaN(target)) {
        currentStreak = 0 // Reset streak if current day's data is invalid
        continue
      }

      const meetsCondition = type === "dailyGoal" ? glasses >= target : day.eveningLog

      if (meetsCondition) {
        if (i === 0) {
          currentStreak = 1
        } else {
          const prevDay = sortedHistory[i - 1]
          const dateCurrent = new Date(day.date)
          const datePrev = new Date(prevDay.date)

          // Check for invalid dates before comparison
          if (isNaN(dateCurrent.getTime()) || isNaN(datePrev.getTime())) {
            currentStreak = 1 // Treat as start of new streak if dates are invalid
            continue
          }

          // Advance previous day by one to check for consecutiveness
          datePrev.setDate(datePrev.getDate() + 1)
          // Compare only date parts (year, month, day)
          if (
            dateCurrent.getFullYear() === datePrev.getFullYear() &&
            dateCurrent.getMonth() === datePrev.getMonth() &&
            dateCurrent.getDate() === datePrev.getDate()
          ) {
            currentStreak++
          } else {
            // Not consecutive, reset streak
            currentStreak = 1
          }
        }
      } else {
        currentStreak = 0
      }
      maxStreak = Math.max(maxStreak, currentStreak)
    }
    return maxStreak
  }

  const currentDailyGoalStreak = calculateStreak(waterHistory, "dailyGoal")
  const nightOwlStreak = calculateStreak(waterHistory, "eveningLog")

  // Define all achievements
  const achievements = [
    {
      id: 1,
      title: "First Drop",
      description: "Log your first glass of water",
      icon: "💧",
      unlocked: waterHistory.length > 0,
      progress: waterHistory.length > 0 ? 100 : 0,
      category: "beginner",
    },
    {
      id: 2,
      title: "Daily Goal",
      description: "Reach your daily water goal",
      icon: "🎯",
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
      category: "daily",
    },
    {
      id: 3,
      title: "Week Warrior",
      description: "Complete 7 days in a row",
      icon: "🏆",
      unlocked: currentDailyGoalStreak >= 7,
      progress: Math.min((currentDailyGoalStreak / 7) * 100, 99),
      category: "streak",
    },
    {
      id: 4,
      title: "Hydration Hero",
      description: "Drink 100 glasses total",
      icon: "🦸",
      unlocked: waterHistory.reduce((total: number, day: any) => total + Number(day.glasses), 0) >= 100,
      progress: Math.min(
        (waterHistory.reduce((total: number, day: any) => total + Number(day.glasses), 0) / 100) * 100,
        100,
      ),
      category: "milestone",
    },
    {
      id: 5,
      title: "Perfect Week",
      description: "Hit your goal every day for a week",
      icon: "⭐",
      unlocked: currentDailyGoalStreak >= 7, // Same as Week Warrior for simplicity
      progress: Math.min((currentDailyGoalStreak / 7) * 100, 99),
      category: "streak",
    },
    {
      id: 6,
      title: "Early Bird",
      description: "Log water before 9 AM for 5 days",
      icon: "🌅",
      unlocked: false, // Requires more granular time tracking per glass
      progress: 0,
      category: "habit",
    },
    {
      id: 7,
      title: "Consistency King",
      description: "30-day streak",
      icon: "👑",
      unlocked: currentDailyGoalStreak >= 30,
      progress: Math.min((currentDailyGoalStreak / 30) * 100, 99),
      category: "streak",
    },
    {
      id: 8,
      title: "Hydration Master",
      description: "Drink 1000 glasses total",
      icon: "🎖️",
      unlocked: waterHistory.reduce((total: number, day: any) => total + Number(day.glasses), 0) >= 1000,
      progress: Math.min(
        (waterHistory.reduce((total: number, day: any) => total + Number(day.glasses), 0) / 1000) * 100,
        99,
      ),
      category: "milestone",
    },
    // New Achievements
    {
      id: 9,
      title: "Night Owl",
      description: "Log a glass of water after 9 PM for 5 days in a row",
      icon: "🌙",
      unlocked: nightOwlStreak >= 5,
      progress: Math.min((nightOwlStreak / 5) * 100, 99),
      category: "habit",
    },
    {
      id: 10,
      title: "Double Up",
      description: "Log two glasses within 10 minutes for the first time",
      icon: "💧💧",
      unlocked: user?.hasDoubleUpped || false,
      progress: user?.hasDoubleUpped ? 100 : 0,
      category: "beginner",
    },
    {
      id: 11,
      title: "Weekend Winner",
      description: "Hit your daily goal on both Saturday and Sunday in the same week",
      icon: "🏖️",
      unlocked: (() => {
        const sortedHistory = [...waterHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        let foundSaturday = false
        let saturdayDate = ""
        for (const day of sortedHistory) {
          const glasses = Number(day.glasses)
          const target = Number(day.target)
          if (isNaN(glasses) || isNaN(target)) continue // Skip invalid data

          if (glasses >= target && isWeekend(day.date)) {
            const date = new Date(day.date)
            if (isNaN(date.getTime())) continue // Skip invalid date

            if (date.getDay() === 6) {
              // Saturday
              foundSaturday = true
              saturdayDate = day.date
            } else if (foundSaturday && date.getDay() === 0 && inSameWeek(saturdayDate, day.date)) {
              // Sunday in same week
              return true
            }
          }
        }
        return false
      })(),
      progress: 0, // Hard to show progress for this one without complex logic
      category: "daily",
    },
    {
      id: 12,
      title: "Streak Saver",
      description: "Hit your daily goal on the last day of the month to keep a long streak alive",
      icon: "🔥",
      unlocked: (() => {
        const sortedHistory = [...waterHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        for (const day of sortedHistory) {
          const date = new Date(day.date)
          if (isNaN(date.getTime())) continue // Skip invalid date

          const glasses = Number(day.glasses)
          const target = Number(day.target)
          if (isNaN(glasses) || isNaN(target)) continue // Skip invalid data

          const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split("T")[0]
          if (day.date === lastDayOfMonth && glasses >= target) {
            // This is a simplified check. A true "streak saver" would need to know if a streak was active.
            return true
          }
        }
        return false
      })(),
      progress: 0, // Hard to show progress for this one
      category: "streak",
    },
    {
      id: 13,
      title: "Hydration Explorer",
      description: "Log water from 3 different cities (detected via location/weather)",
      icon: "🌍",
      unlocked: (user?.loggedCities?.length || 0) >= 3,
      progress: Math.min(((user?.loggedCities?.length || 0) / 3) * 100, 99),
      category: "milestone",
    },
  ]

  const unlockedCount = achievements.filter((a) => a.unlocked).length
  const totalPoints = unlockedCount * 100

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "beginner":
        return "from-green-400 to-green-600"
      case "daily":
        return "from-blue-400 to-blue-600"
      case "streak":
        return "from-yellow-400 to-yellow-600"
      case "milestone":
        return "from-purple-400 to-purple-600"
      case "habit":
        return "from-pink-400 to-pink-600"
      default:
        return "from-gray-400 to-gray-600"
    }
  }

  const themeClasses =
    theme === "dark"
      ? "bg-gradient-to-br from-gray-800 via-blue-900 to-blue-800 text-white"
      : "bg-gradient-to-br from-white via-blue-50 to-blue-100 text-blue-900"

  const cardClasses =
    theme === "dark" ? "bg-gray-800/80 border-blue-700 text-white" : "bg-white border-blue-200 text-blue-900"

  return (
    <div className={`min-h-screen p-6 ${themeClasses}`}>
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className={`${theme === "dark" ? "text-white" : "text-blue-600"}`}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold ml-4">Achievements</h1>
      </div>

      <div className="flex justify-center mb-8">
        {isPremium ? (
          <PremiumBuddy size="large" expression="love" activity="celebrating" waterLevel={90} isDraggable={false} />
        ) : (
          <FunnyBuddy size="large" expression="love" activity="celebrating" waterLevel={90} />
        )}
      </div>

      {/* Achievement Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className={`${cardClasses} shadow-lg`}>
          <CardContent className="p-4 text-center">
            <Trophy className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-500">{unlockedCount}</div>
            <div className="text-sm opacity-80">Unlocked</div>
          </CardContent>
        </Card>
        <Card className={`${cardClasses} shadow-lg`}>
          <CardContent className="p-4 text-center">
            <Star className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-500">{totalPoints}</div>
            <div className="text-sm opacity-80">Points</div>
          </CardContent>
        </Card>
        <Card className={`${cardClasses} shadow-lg`}>
          <CardContent className="p-4 text-center">
            <Target className="h-6 w-6 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-500">
              {Math.round((unlockedCount / achievements.length) * 100)}%
            </div>
            <div className="text-sm opacity-80">Complete</div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements Grid - All visible but locked ones show lock */}
      <div className="space-y-4">
        {achievements.map((achievement) => (
          <Card
            key={achievement.id}
            className={`${cardClasses} shadow-lg ${
              achievement.unlocked ? `bg-gradient-to-r ${getCategoryColor(achievement.category)}/20` : ""
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                    achievement.unlocked ? "bg-white/20" : "bg-gray-500/20"
                  }`}
                >
                  {achievement.unlocked ? achievement.icon : <Lock className="h-6 w-6 text-gray-500" />}
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold ${achievement.unlocked ? "" : "opacity-60"}`}>{achievement.title}</h3>
                  <p className={`text-sm ${achievement.unlocked ? "opacity-80" : "opacity-50"}`}>
                    {achievement.description}
                  </p>
                  {!achievement.unlocked && achievement.progress > 0 && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs opacity-60 mb-1">
                        <span>Progress</span>
                        <span>{Math.round(achievement.progress)}%</span>
                      </div>
                      <div className={`w-full ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"} rounded-full h-2`}>
                        <div
                          className={`bg-gradient-to-r ${getCategoryColor(achievement.category)} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${achievement.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
                {achievement.unlocked && (
                  <div className="text-right">
                    <Zap className="h-5 w-5 text-yellow-500 mx-auto" />
                    <div className="text-yellow-500 text-sm font-semibold">+100</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Motivational Message */}
      <Card className={`${cardClasses} mt-6 shadow-lg`}>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2">🎯 Keep Going!</h3>
          <p className="text-sm opacity-80">Complete your daily water goals to unlock more achievements!</p>
        </CardContent>
      </Card>
    </div>
  )
}
