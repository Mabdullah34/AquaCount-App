"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit3, Crown, ArrowLeft } from "lucide-react"
import { FunnyBuddy } from "@/components/funny-buddy"
import { PremiumBuddy } from "@/components/premium-buddy"
import { useSound } from "@/hooks/use-sound"

interface ProfileScreenProps {
  user: any
  onBack: () => void
  onUpdateUser: (user: any) => void
  theme: "light" | "dark"
  onLogout: () => void
}

export function ProfileScreen({ user, onBack, onUpdateUser, theme, onLogout }: ProfileScreenProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(user || {})
  const { playClickSound } = useSound()

  const isPremium = user?.subscription?.plan !== "free"

  const handleSave = () => {
    playClickSound()
    onUpdateUser(formData)
    setIsEditing(false)
  }

  const handleEdit = () => {
    playClickSound()
    if (!isPremium) {
      alert("Upgrade to Premium to edit your profile!")
      return
    }
    setIsEditing(!isEditing)
  }

  // Get user's achievements/badges
  const getUserBadges = () => {
    const waterHistory = user?.waterHistory || []
    const badges = []

    // First Drop badge
    if (waterHistory.length > 0) {
      badges.push({ name: "First Drop", icon: "💧", description: "Logged first glass" })
    }

    // Daily Goal badge
    const hasReachedGoal = waterHistory.some((day: any) => day.glasses >= day.target)
    if (hasReachedGoal) {
      badges.push({ name: "Daily Goal", icon: "🎯", description: "Reached daily goal" })
    }

    // Week Warrior badge
    const last7Days = waterHistory.slice(-7)
    const weekSuccess = last7Days.length === 7 && last7Days.every((day: any) => day.glasses >= day.target)
    if (weekSuccess) {
      badges.push({ name: "Week Warrior", icon: "🏆", description: "7 days perfect streak" })
    }

    return badges
  }

  const themeClasses =
    theme === "dark"
      ? "bg-gradient-to-br from-gray-800 via-blue-900 to-blue-800 text-white"
      : "bg-gradient-to-br from-white via-blue-50 to-blue-100 text-blue-900"

  const cardClasses =
    theme === "dark" ? "bg-gray-800/80 border-blue-700 text-white" : "bg-white border-blue-200 text-blue-900"

  const userBadges = getUserBadges()

  return (
    <div className={`min-h-screen p-6 ${themeClasses}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className={`${theme === "dark" ? "text-white" : "text-blue-600"}`}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold ml-4">Profile</h1>
          {isPremium && <Crown className="h-6 w-6 ml-2 text-yellow-500" />}
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={handleEdit}
            variant="outline"
            size="sm"
            className={`${theme === "dark" ? "border-gray-600 text-white hover:bg-gray-700" : "border-blue-200 text-blue-600 hover:bg-blue-50"} bg-transparent`}
          >
            <Edit3 className="h-4 w-4 mr-2" />
            {isEditing ? "Cancel" : isPremium ? "Edit" : "Premium Only"}
          </Button>
          <Button
            onClick={() => {
              playClickSound()
              onLogout()
            }}
            variant="destructive"
            size="sm"
          >
            Logout
          </Button>
        </div>
      </div>

      <div className="flex justify-center mb-8">
        {isPremium ? (
          <PremiumBuddy size="large" expression="happy" activity="floating" waterLevel={85} isDraggable={false} />
        ) : (
          <FunnyBuddy size="large" expression="happy" activity="floating" waterLevel={85} />
        )}
      </div>

      {/* User Badges */}
      {userBadges.length > 0 && (
        <Card className={`${cardClasses} mb-6 shadow-lg`}>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Your Badges</h3>
            <div className="grid grid-cols-3 gap-4">
              {userBadges.map((badge, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl mb-2">{badge.icon}</div>
                  <div className="text-sm font-semibold">{badge.name}</div>
                  <div className="text-xs opacity-70">{badge.description}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className={`${cardClasses} shadow-lg`}>
          <CardContent className="p-4 text-center">
            <div className="text-xl font-bold text-blue-600">{formData.dailyTarget || 8}</div>
            <div className="text-xs opacity-80">Daily Target</div>
          </CardContent>
        </Card>
        <Card className={`${cardClasses} shadow-lg`}>
          <CardContent className="p-4 text-center">
            <div className="text-xl font-bold text-blue-600">{user?.waterHistory?.length || 0}</div>
            <div className="text-xs opacity-80">Days Active</div>
          </CardContent>
        </Card>
        <Card className={`${cardClasses} shadow-lg`}>
          <CardContent className="p-4 text-center">
            <div className="text-xl font-bold text-blue-600">{userBadges.length}</div>
            <div className="text-xs opacity-80">Badges</div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Information */}
      <div className="space-y-4">
        <Card className={`${cardClasses} shadow-lg`}>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label className="font-semibold">Name</Label>
              <Input
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-blue-200 text-blue-900"}`}
                disabled={!isEditing}
              />
            </div>

            <div>
              <Label className="font-semibold">Email</Label>
              <Input
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-blue-200 text-blue-900"}`}
                disabled={!isEditing}
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="font-semibold">Age</Label>
                <Input
                  type="number"
                  value={formData.age || ""}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className={`${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-blue-200 text-blue-900"}`}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label className="font-semibold">Weight (kg)</Label>
                <Input
                  type="number"
                  value={formData.weight || ""}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className={`${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-blue-200 text-blue-900"}`}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label className="font-semibold">Height (cm)</Label>
                <Input
                  type="number"
                  value={formData.height || ""}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  className={`${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-blue-200 text-blue-900"}`}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div>
              <Label className="font-semibold">Activity Level</Label>
              <Select
                value={formData.activityLevel || ""}
                onValueChange={(value) => setFormData({ ...formData, activityLevel: value })}
                disabled={!isEditing}
              >
                <SelectTrigger
                  className={`${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-blue-200 text-blue-900"}`}
                >
                  <SelectValue placeholder="Select activity level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lazy">Lazy</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="font-semibold">Goal</Label>
                <Select
                  value={formData.goal || ""}
                  onValueChange={(value) => setFormData({ ...formData, goal: value })}
                  disabled={!isEditing}
                >
                  <SelectTrigger
                    className={`${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-blue-200 text-blue-900"}`}
                  >
                    <SelectValue placeholder="Goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">General Health</SelectItem>
                    <SelectItem value="fitness">Fitness</SelectItem>
                    <SelectItem value="skin">Skin Health</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="font-semibold">Health Condition</Label>
                <Select
                  value={formData.disease || ""}
                  onValueChange={(value) => setFormData({ ...formData, disease: value })}
                  disabled={!isEditing}
                >
                  <SelectTrigger
                    className={`${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-blue-200 text-blue-900"}`}
                  >
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="fever">Fever</SelectItem>
                    <SelectItem value="kidney_stones">Kidney Stones</SelectItem>
                    <SelectItem value="kidney_failure">Kidney Failure</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="font-semibold">City</Label>
              <Input
                value={formData.city || ""}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className={`${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-blue-200 text-blue-900"}`}
                disabled={!isEditing}
              />
            </div>
          </CardContent>
        </Card>

        {isEditing && (
          <Button
            onClick={handleSave}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-2xl text-lg"
          >
            Save Changes
          </Button>
        )}
      </div>
    </div>
  )
}
