"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Palette, Volume2, ArrowLeft } from "lucide-react"
import { FunnyBuddy } from "@/components/funny-buddy"
import { PremiumBuddy } from "@/components/premium-buddy"
import { useSound } from "@/hooks/use-sound"

interface SettingsScreenProps {
  user: any
  onBack: () => void
  onUpdateUser: (user: any) => void
  theme: "light" | "dark"
  onThemeChange: (theme: "light" | "dark") => void
}

export function SettingsScreen({ user, onBack, onUpdateUser, theme, onThemeChange }: SettingsScreenProps) {
  const [settings, setSettings] = useState({
    theme: theme,
    sounds: user?.settings?.sounds || true,
    animations: user?.settings?.animations || true,
  })
  const { playClickSound } = useSound()
  const isPremium = user?.subscription?.plan !== "free"

  const handleSave = () => {
    playClickSound()
    const updatedUser = {
      ...user,
      settings: settings,
    }
    onUpdateUser(updatedUser)
    onThemeChange(settings.theme)
    onBack()
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
        <h1 className="text-2xl font-bold ml-4">Settings</h1>
      </div>

      <div className="flex justify-center mb-8">
        {isPremium ? (
          <PremiumBuddy size="large" expression="wink" activity="floating" waterLevel={60} isDraggable={false} />
        ) : (
          <FunnyBuddy size="large" expression="wink" activity="floating" waterLevel={60} />
        )}
      </div>

      <div className="space-y-6">
        {/* Appearance */}
        <Card className={`${cardClasses} shadow-lg`}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Palette className="h-5 w-5 text-blue-500" />
              <Label className="font-semibold">Appearance</Label>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Theme</Label>
                  <p className="text-sm opacity-70">Choose your preferred theme</p>
                </div>
                <Select
                  value={settings.theme}
                  onValueChange={(value: "light" | "dark") => {
                    playClickSound()
                    setSettings({ ...settings, theme: value })
                  }}
                >
                  <SelectTrigger
                    className={`${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-blue-200 text-blue-900"} w-32`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Buddy Animations</Label>
                  <p className="text-sm opacity-70">Enable buddy animations</p>
                </div>
                <Switch
                  checked={settings.animations}
                  onCheckedChange={(checked) => {
                    playClickSound()
                    setSettings({ ...settings, animations: checked })
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audio */}
        <Card className={`${cardClasses} shadow-lg`}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Volume2 className="h-5 w-5 text-blue-500" />
              <Label className="font-semibold">Audio</Label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Sound Effects</Label>
                <p className="text-sm opacity-70">Play sounds for interactions</p>
              </div>
              <Switch
                checked={settings.sounds}
                onCheckedChange={(checked) => {
                  playClickSound()
                  setSettings({ ...settings, sounds: checked })
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* App Info */}
        <Card className={`${cardClasses} shadow-lg`}>
          <CardContent className="p-4 text-center">
            <p className="text-sm opacity-70">AquaCount v1.0.0</p>
            <p className="text-xs opacity-50 mt-1">Made with 💧 for your health</p>
          </CardContent>
        </Card>

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
