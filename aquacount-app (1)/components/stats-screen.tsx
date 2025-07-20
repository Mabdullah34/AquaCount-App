"use client"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Calendar, Droplets, ArrowLeft } from "lucide-react"
import { FunnyBuddy } from "@/components/funny-buddy"
import { PremiumBuddy } from "@/components/premium-buddy"
import { useSound } from "@/hooks/use-sound"
import { Button } from "@/components/ui/button"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts" // Import recharts components
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart" // Import shadcn chart components

interface StatsScreenProps {
  user: any
  onBack: () => void
  theme: "light" | "dark"
}

export function StatsScreen({ user, onBack, theme }: StatsScreenProps) {
  const { playClickSound } = useSound()
  const isPremium = user?.subscription?.plan !== "free"
  const waterHistory = user?.waterHistory || []

  // Calculate real user statistics
  const getWeeklyData = () => {
    const last7Days = []
    const today = new Date()

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]

      const dayData = waterHistory.find((day: any) => day.date === dateStr)
      const dayName = date.toLocaleDateString("en", { weekday: "short" })

      last7Days.push({
        day: dayName,
        glasses: dayData?.glasses || 0,
        target: dayData?.target || user?.dailyTarget || 8,
        date: dateStr,
      })
    }

    return last7Days
  }

  const getMonthlyData = () => {
    const thisMonth = waterHistory.filter((day: any) => {
      const dayDate = new Date(day.date)
      const now = new Date()
      return dayDate.getMonth() === now.getMonth() && dayDate.getFullYear() === now.getFullYear()
    })

    const totalGlasses = thisMonth.reduce((sum: number, day: any) => sum + day.glasses, 0)
    const perfectDays = thisMonth.filter((day: any) => day.glasses >= day.target).length
    const currentStreak = calculateCurrentStreak()
    const bestStreak = calculateBestStreak()

    return { totalGlasses, perfectDays, currentStreak, bestStreak }
  }

  const calculateCurrentStreak = () => {
    let streak = 0
    const sortedHistory = [...waterHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    for (const day of sortedHistory) {
      if (day.glasses >= day.target) {
        streak++
      } else {
        break
      }
    }

    return streak
  }

  const calculateBestStreak = () => {
    let bestStreak = 0
    let currentStreak = 0
    const sortedHistory = [...waterHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    for (const day of sortedHistory) {
      if (day.glasses >= day.target) {
        currentStreak++
        bestStreak = Math.max(bestStreak, currentStreak)
      } else {
        currentStreak = 0
      }
    }

    return bestStreak
  }

  const weeklyData = getWeeklyData()
  const monthlyData = getMonthlyData()
  const totalGlasses = weeklyData.reduce((sum, day) => sum + day.glasses, 0)
  const averageDaily = totalGlasses > 0 ? Math.round(totalGlasses / 7) : 0
  const successRate =
    weeklyData.length > 0 ? Math.round((weeklyData.filter((day) => day.glasses >= day.target).length / 7) * 100) : 0

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
        <h1 className="text-2xl font-bold ml-4">Your Progress</h1>
      </div>

      <div className="flex justify-center mb-8">
        {isPremium ? (
          <PremiumBuddy size="large" expression="excited" activity="celebrating" waterLevel={75} isDraggable={false} />
        ) : (
          <FunnyBuddy size="large" expression="excited" activity="celebrating" waterLevel={75} />
        )}
      </div>

      {/* Weekly Overview */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className={`${cardClasses} shadow-lg`}>
          <CardContent className="p-4 text-center">
            <Droplets className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{totalGlasses}</div>
            <div className="text-sm opacity-80">This Week</div>
          </CardContent>
        </Card>
        <Card className={`${cardClasses} shadow-lg`}>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{averageDaily}</div>
            <div className="text-sm opacity-80">Daily Avg</div>
          </CardContent>
        </Card>
        <Card className={`${cardClasses} shadow-lg`}>
          <CardContent className="p-4 text-center">
            <Calendar className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{successRate}%</div>
            <div className="text-sm opacity-80">Success Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Chart */}
      <Card className={`${cardClasses} mb-6 shadow-lg`}>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Weekly Progress</h3>
          <ChartContainer
            config={{
              glasses: {
                label: "Glasses Drank",
                color: "hsl(var(--chart-1))",
              },
              target: {
                label: "Daily Target",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-[200px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="glasses"
                  stroke="var(--color-glasses)"
                  strokeWidth={2}
                  dot={{
                    fill: "var(--color-glasses)",
                  }}
                  name="Glasses Drank"
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="var(--color-target)"
                  strokeWidth={2}
                  dot={{
                    fill: "var(--color-target)",
                  }}
                  strokeDasharray="5 5"
                  name="Daily Target"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Monthly Stats */}
      <Card className={`${cardClasses} mb-6 shadow-lg`}>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Monthly Overview</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{monthlyData.totalGlasses}</div>
              <div className="text-sm opacity-80">Total Glasses</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{monthlyData.perfectDays}</div>
              <div className="text-sm opacity-80">Perfect Days</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{monthlyData.currentStreak}</div>
              <div className="text-sm opacity-80">Current Streak</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{monthlyData.bestStreak}</div>
              <div className="text-sm opacity-80">Best Streak</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Motivational Message */}
      {waterHistory.length === 0 && (
        <Card className={`${cardClasses} shadow-lg`}>
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold mb-2">Start Your Journey!</h3>
            <p className="text-sm opacity-80">Begin tracking your water intake to see your progress here.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
