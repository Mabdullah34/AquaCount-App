"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import { FunnyBuddy } from "@/components/funny-buddy"
import { Checkbox } from "@/components/ui/checkbox"

interface AuthScreenProps {
  onLogin: (userData: any) => void
  onBack: () => void
  // initialMode is no longer needed as there's only one flow
}

// Water calculation logic (kept for new user registration)
function calculateWaterRecommendation(
  weightKg: number,
  age: number,
  activityLevel: string,
  goal: string,
  diseaseOrCondition: string,
  temperatureC = 25,
) {
  let dailyGlasses = (weightKg * 35) / 250

  if (activityLevel === "active") dailyGlasses += 2
  else if (activityLevel === "moderate") dailyGlasses += 1

  if (goal === "fitness" || goal === "skin") dailyGlasses += 1

  if (temperatureC > 30) dailyGlasses += 1
  else if (temperatureC < 0) dailyGlasses = Math.max(1, dailyGlasses - 2)

  const moreWaterConditions = ["fever", "diarrhea", "vomiting", "kidney_stones", "uti", "constipation", "heat_stroke"]
  if (moreWaterConditions.includes(diseaseOrCondition)) {
    dailyGlasses += 1
  }

  const restrictedConditions = ["kidney_failure", "heart_failure", "cirrhosis", "hyponatremia", "siadh"]
  if (restrictedConditions.includes(diseaseOrCondition)) {
    dailyGlasses = Math.min(dailyGlasses, 6)
  }

  if (dailyGlasses < 4) dailyGlasses = 4
  if (dailyGlasses > 15) dailyGlasses = 15

  return Math.round(dailyGlasses)
}

export function AuthScreen({ onLogin, onBack }: AuthScreenProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "", // Keep email for pre-filling from Google
    age: "",
    weight: "",
    height: "",
    activityLevel: "",
    goal: "",
    disease: "",
    city: "",
  })
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false) // State to show profile completion form

  const termsAndPoliciesText = `
    📜 AquaCount Terms of Service & Privacy Policy
    Last updated: [07/17/2025]

    Welcome to AquaCount!
    By downloading or using this app, you agree to the following terms. Please read carefully before using.

    ✅ General Use
    AquaCount is designed to help you track your daily water intake and receive hydration recommendations based on general factors like age, weight, activity level, and weather.
    This app is not a medical device. It is for general wellness and educational purposes only.

    ⚠️ Health Disclaimer
    If you are pregnant, breastfeeding, or have any medical condition (including but not limited to kidney disease, heart failure, liver cirrhosis, hyponatremia, or other fluid-related conditions), do not rely solely on this app's recommendations.
    Always consult a doctor or qualified healthcare professional before following any hydration advice.
    If you use AquaCount despite a medical condition or pregnancy, you do so at your own risk.
    AquaCount and its team are not responsible for any health consequences, injuries, or issues arising from misuse of the app.

    ✉️ Contact for Support
    If you face any problems, errors, or have concerns about your account, please email us at:
    📧 aquacount.helpcenter@gmail.com

    🔒 Privacy & Data
    We collect and store data you provide (such as name, email, age, weight, and hydration logs) to improve your experience and sync data across devices.
    Your data is stored securely in Firebase and is not sold or shared with third parties except as required by law.
    You can request deletion of your account and data anytime by contacting us at the above email.

    💳 Subscriptions & Payments
    AquaCount offers optional premium subscriptions (monthly, yearly, and lifetime plans) to unlock extra features.
    Payments are processed securely through third‑party payment providers (e.g., Stripe/Play Store).
    Subscription renewals are automatic unless you cancel before the billing date.
    We do not offer medical reimbursement or liability for misuse of premium features.

    🚫 Prohibited Use
    You agree not to:
    Use false information or fake emails when registering.
    Attempt to hack, reverse engineer, or misuse the app or its services.
    Upload harmful content or violate any applicable laws.

    📌 Limitation of Liability
    AquaCount is provided "as is." We make no guarantees regarding accuracy, uptime, or specific outcomes.
    We are not responsible for any indirect, incidental, or consequential damages arising from the use of AquaCount.

    🔄 Changes to Terms
    We may update these Terms & Policies from time to time. Continued use of the app means you accept the changes.

    By using AquaCount, you confirm that you have read, understood, and agree to these Terms and Policies.
  `

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      // Mock Google sign-in for preview
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Simulate a new user vs. existing user scenario for preview
      const isNewUser = Math.random() > 0.5 // 50% chance to be a new user in preview

      if (isNewUser) {
        // Simulate pre-filling data for a new Google user
        setFormData({
          ...formData,
          name: "New Google User",
          email: "new.google.user@example.com",
        })
        setShowAdditionalInfo(true) // Show the profile completion form
      } else {
        // Simulate an existing Google user logging in
        const mockExistingUser = {
          uid: "mock-existing-uid",
          name: "Existing Google User",
          email: "existing.google.user@example.com",
          age: "30",
          weight: "75",
          height: "175",
          activityLevel: "active",
          goal: "fitness",
          disease: "none",
          city: "London",
          subscription: {
            plan: "free",
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
          dailyTarget: 10,
          waterHistory: [
            {
              date: new Date().toISOString().split("T")[0],
              glasses: 5,
              target: 10,
              timestamp: new Date().toISOString(),
              eveningLog: false,
            },
          ],
          joinDate: new Date().toISOString(),
          notificationSettings: {
            enabled: true,
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
          loggedCities: ["London"],
          authProvider: "google",
        }
        onLogin(mockExistingUser)
      }
    } catch (error: any) {
      console.error("Mock Google sign-in error:", error)
      alert("This is a preview - Google sign-in is mocked")
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!termsAccepted) {
      alert("You must accept the Terms of Service & Privacy Policy to create an account.")
      setLoading(false)
      return
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call

      const dailyTarget = calculateWaterRecommendation(
        Number.parseInt(formData.weight),
        Number.parseInt(formData.age),
        formData.activityLevel,
        formData.goal,
        formData.disease,
        25,
      )

      const newUserProfile = {
        uid: "mock-google-uid-" + Math.random().toString(36).substring(7), // Unique mock UID
        name: formData.name,
        email: formData.email,
        age: formData.age,
        weight: formData.weight,
        height: formData.height,
        activityLevel: formData.activityLevel,
        goal: formData.goal,
        disease: formData.disease,
        city: formData.city,
        subscription: {
          plan: "free",
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        dailyTarget,
        waterHistory: [],
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
        loggedCities: [formData.city],
        authProvider: "google",
      }

      onLogin(newUserProfile)
    } catch (error: any) {
      console.error("Profile completion error:", error)
      alert("Failed to complete profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // If showing additional info form for Google users
  if (showAdditionalInfo) {
    return (
      <div className="min-h-screen p-6 text-blue-900">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setShowAdditionalInfo(false)
              // Optionally, you might want to go back to welcome or clear auth state here
            }}
            className="text-blue-600"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold ml-4">Complete Your Profile</h1>
        </div>

        <div className="flex justify-center mb-6">
          <FunnyBuddy size="medium" expression="excited" activity="floating" waterLevel={50} />
        </div>

        <p className="text-center mb-6 text-blue-700">
          Welcome! Please complete your profile to get personalized water recommendations.
        </p>

        <form onSubmit={handleCompleteProfile} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-blue-800">
              Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-white border-blue-200 text-blue-900"
              placeholder="Enter your name"
              required
            />
          </div>
          <div>
            <Label htmlFor="email" className="text-blue-800">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="bg-white border-blue-200 text-blue-900"
              placeholder="Your Google email"
              disabled // Email is pre-filled from Google
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor="age" className="text-blue-800">
                Age
              </Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="bg-white border-blue-200 text-blue-900"
                placeholder="25"
                required
              />
            </div>
            <div>
              <Label htmlFor="weight" className="text-blue-800">
                Weight (kg)
              </Label>
              <Input
                id="weight"
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="bg-white border-blue-200 text-blue-900"
                placeholder="70"
                required
              />
            </div>
            <div>
              <Label htmlFor="height" className="text-blue-800">
                Height (cm)
              </Label>
              <Input
                id="height"
                type="number"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                className="bg-white border-blue-200 text-blue-900"
                placeholder="170"
                required
              />
            </div>
          </div>

          <div>
            <Label className="text-blue-800">Activity Level</Label>
            <Select
              value={formData.activityLevel}
              onValueChange={(value) => setFormData({ ...formData, activityLevel: value })}
              required
            >
              <SelectTrigger className="bg-white border-blue-200 text-blue-900">
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
              <Label className="text-blue-800">Goal</Label>
              <Select
                value={formData.goal}
                onValueChange={(value) => setFormData({ ...formData, goal: value })}
                required
              >
                <SelectTrigger className="bg-white border-blue-200 text-blue-900">
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
              <Label className="text-blue-800">Health Condition</Label>
              <Select
                value={formData.disease}
                onValueChange={(value) => setFormData({ ...formData, disease: value })}
                required
              >
                <SelectTrigger className="bg-white border-blue-200 text-blue-900">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="fever">Fever</SelectItem>
                  <SelectItem value="diarrhea">Diarrhea</SelectItem>
                  <SelectItem value="kidney_stones">Kidney Stones</SelectItem>
                  <SelectItem value="uti">UTI</SelectItem>
                  <SelectItem value="kidney_failure">Kidney Failure</SelectItem>
                  <SelectItem value="heart_failure">Heart Failure</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="city" className="text-blue-800">
              City
            </Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="bg-white border-blue-200 text-blue-900"
              placeholder="New York"
              required
            />
          </div>

          <div className="flex items-center space-x-2 mt-4">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked: boolean) => setTermsAccepted(checked)}
            />
            <Label htmlFor="terms" className="text-sm text-blue-800">
              I accept the{" "}
              <span className="underline cursor-pointer text-blue-600" onClick={() => setShowTerms(!showTerms)}>
                Terms of Service & Privacy Policy
              </span>
            </Label>
          </div>

          {showTerms && (
            <div className="bg-blue-50 p-4 rounded-lg text-blue-800 text-sm max-h-60 overflow-y-auto">
              <pre className="whitespace-pre-wrap font-sans">{termsAndPoliciesText}</pre>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-blue-600 text-white hover:bg-blue-700 font-semibold py-4 rounded-2xl text-lg mt-6"
            disabled={loading || !termsAccepted}
          >
            {loading ? "Creating Account..." : "Complete Registration"}
          </Button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 text-blue-900">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} className="text-blue-600">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold ml-4">Join AquaCount</h1>
      </div>

      <div className="flex justify-center mb-6">
        <FunnyBuddy size="medium" expression="happy" activity="floating" waterLevel={30} />
      </div>

      {/* Google Sign-In Button */}
      <Button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 font-semibold py-4 rounded-2xl text-lg mb-4 flex items-center justify-center"
      >
        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        {loading ? "Signing in..." : `Continue with Google (Preview)`}
      </Button>

      <p className="text-sm text-center text-blue-600 mt-4">
        Sign in with your Google account to start your hydration journey.
      </p>
    </div>
  )
}
