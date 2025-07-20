"use client"

import { Button } from "@/components/ui/button"
import { FunnyBuddy } from "@/components/funny-buddy"
import { useSound } from "@/hooks/use-sound"

interface WelcomeScreenProps {
  onGetStarted: () => void
  onGoToLogin: () => void // New prop for "I have an account"
}

export function WelcomeScreen({ onGetStarted, onGoToLogin }: WelcomeScreenProps) {
  const { playClickSound } = useSound()

  const handleGetStarted = () => {
    playClickSound()
    onGetStarted()
  }

  const handleGoToLoginClick = () => {
    playClickSound()
    onGoToLogin()
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-blue-900">
      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
        <div className="relative">
          <FunnyBuddy size="large" expression="excited" activity="dancing" waterLevel={75} />
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold leading-tight text-blue-800">AquaCount</h1>
          <h2 className="text-2xl font-semibold text-blue-700">Build healthy habits with us</h2>
          <p className="text-blue-600 text-lg">Track your daily water intake and stay hydrated</p>
        </div>
      </div>

      <div className="w-full space-y-4">
        <Button
          onClick={handleGetStarted}
          className="w-full bg-blue-600 text-white hover:bg-blue-700 font-semibold py-4 rounded-2xl text-lg shadow-lg"
        >
          Get started
        </Button>
        <button onClick={handleGoToLoginClick} className="w-full text-blue-600 underline">
          I have an account
        </button>
      </div>

      <p className="text-xs text-blue-500 text-center mt-4">
        By starting or signing in you agree to our Terms of Service
      </p>
    </div>
  )
}
