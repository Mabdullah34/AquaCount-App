"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, Clock, ArrowLeft } from "lucide-react"
import { FunnyBuddy } from "@/components/funny-buddy"
import { PremiumBuddy } from "@/components/premium-buddy"
import { useSound } from "@/hooks/use-sound"

interface NotificationSettingsProps {
  user: any
  onBack: () => void
  onUpdateUser: (user: any) => void
  theme: "light" | "dark"
}

export function NotificationSettings({ user, onBack, onUpdateUser, theme }: NotificationSettingsProps) {
  const [settings, setSettings] = useState({
    enabled: user?.notificationSettings?.enabled || false,
    frequency: user?.notificationSettings?.frequency || "60",
    startTime: user?.notificationSettings?.startTime || "08:00",
    endTime: user?.notificationSettings?.endTime || "22:00",
    sound: user?.notificationSettings?.sound || true,
    motivationalMessages: user?.notificationSettings?.motivationalMessages || true,
  })
  const { playClickSound } = useSound()
  const isPremium = user?.subscription?.plan !== "free"

  const handleSave = () => {
    playClickSound()
    const updatedUser = {
      ...user,
      notificationSettings: settings,
    }
    onUpdateUser(updatedUser)
    onBack()
  }

  const handleToggleNotifications = async () => {
    playClickSound()
    if (!settings.enabled) {
      if (Notification.permission === "default") {
        const permission = await Notification.requestPermission()
        if (permission !== "granted") {
          alert("Please enable notifications in your browser settings to receive reminders.")
          return
        }
      }
    }
    setSettings({ ...settings, enabled: !settings.enabled })
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
        <h1 className="text-2xl font-bold ml-4">Notifications</h1>
      </div>

      <div className="flex justify-center mb-8">
        {isPremium ? (
          <PremiumBuddy size="large" expression="wink" activity="dancing" waterLevel={65} isDraggable={false} />
        ) : (
          <FunnyBuddy size="large" expression="wink" activity="dancing" waterLevel={65} />
        )}
      </div>

      <div className="space-y-6">
        {/* Enable Notifications */}
        <Card className={`${cardClasses} shadow-lg`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="h-5 w-5 text-blue-500" />
                <div>
                  <Label className="font-semibold">Enable Reminders</Label>
                  <p className="text-sm opacity-70">Get notified to drink water throughout the day</p>
                </div>
              </div>
              <Switch checked={settings.enabled} onCheckedChange={handleToggleNotifications} />
            </div>
          </CardContent>
        </Card>

        {settings.enabled && (
          <>
            {/* Frequency */}
            <Card className={`${cardClasses} shadow-lg`}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <Label className="font-semibold">Reminder Frequency</Label>
                </div>
                <Select
                  value={settings.frequency}
                  onValueChange={(value) => {
                    playClickSound()
                    setSettings({ ...settings, frequency: value })
                  }}
                >
                  <SelectTrigger
                    className={`${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-blue-200 text-blue-900"}`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">Every 30 minutes</SelectItem>
                    <SelectItem value="60">Every hour</SelectItem>
                    <SelectItem value="90">Every 1.5 hours</SelectItem>
                    <SelectItem value="120">Every 2 hours</SelectItem>
                    <SelectItem value="180">Every 3 hours</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Active Hours */}
            <Card className={`${cardClasses} shadow-lg`}>
              <CardContent className="p-6">
                <Label className="font-semibold mb-4 block">Active Hours</Label>
                <p className="text-sm opacity-70 mb-4">Notifications will be OFF during these hours</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm opacity-80">Start Time (OFF)</Label>
                    <Select
                      value={settings.startTime}
                      onValueChange={(value) => {
                        playClickSound()
                        setSettings({ ...settings, startTime: value })
                      }}
                    >
                      <SelectTrigger
                        className={`${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-blue-200 text-blue-900"}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => {
                          const hour = i.toString().padStart(2, "0")
                          return (
                            <SelectItem key={hour} value={`${hour}:00`}>
                              {hour}:00
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm opacity-80">End Time (OFF)</Label>
                    <Select
                      value={settings.endTime}
                      onValueChange={(value) => {
                        playClickSound()
                        setSettings({ ...settings, endTime: value })
                      }}
                    >
                      <SelectTrigger
                        className={`${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-blue-200 text-blue-900"}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => {
                          const hour = i.toString().padStart(2, "0")
                          return (
                            <SelectItem key={hour} value={`${hour}:00`}>
                              {hour}:00
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        <Button
          onClick={handleSave}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-2xl text-lg"
        >
          Save Settings
        </Button>
      </div>
    </div>
  )
}
