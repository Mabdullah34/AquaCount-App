"use client"

import { useEffect, useState } from "react"

interface AnimatedBuddyProps {
  size?: "small" | "medium" | "large"
  expression?: "happy" | "sleepy" | "excited" | "wink" | "love"
  activity?: "idle" | "dancing" | "jumping" | "floating" | "celebrating"
  waterLevel?: number // 0-100 for filling effect
}

export function AnimatedBuddy({
  size = "medium",
  expression = "happy",
  activity = "idle",
  waterLevel = 50,
}: AnimatedBuddyProps) {
  const [currentAnimation, setCurrentAnimation] = useState(activity)
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([])

  const sizeClasses = {
    small: "w-12 h-16",
    medium: "w-20 h-26",
    large: "w-32 h-40",
  }

  const expressions = {
    happy: "😊",
    sleepy: "😴",
    excited: "🤩",
    wink: "😉",
    love: "😍",
  }

  // Generate floating particles
  useEffect(() => {
    if (activity === "celebrating" || activity === "dancing") {
      const newParticles = Array.from({ length: 6 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2,
      }))
      setParticles(newParticles)
    } else {
      setParticles([])
    }
  }, [activity])

  // Auto-change animations for idle state
  useEffect(() => {
    if (activity === "idle") {
      const animations = ["floating", "idle", "dancing"]
      const interval = setInterval(() => {
        const randomAnimation = animations[Math.floor(Math.random() * animations.length)]
        setCurrentAnimation(randomAnimation)
      }, 4000)
      return () => clearInterval(interval)
    } else {
      setCurrentAnimation(activity)
    }
  }, [activity])

  const getAnimationClass = () => {
    switch (currentAnimation) {
      case "dancing":
        return "animate-pulse"
      case "jumping":
        return "animate-bounce"
      case "floating":
        return "animate-float"
      case "celebrating":
        return "animate-bounce"
      default:
        return "animate-float"
    }
  }

  const getBuddyColor = () => {
    const fillPercentage = Math.min(waterLevel, 100)
    if (fillPercentage > 80) return "from-blue-300 to-blue-500"
    if (fillPercentage > 50) return "from-blue-200 to-blue-400"
    if (fillPercentage > 20) return "from-blue-100 to-blue-300"
    return "from-gray-200 to-blue-200"
  }

  return (
    <div className={`relative ${sizeClasses[size]} ${getAnimationClass()}`}>
      {/* Floating particles for celebration */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 bg-yellow-300 rounded-full animate-ping opacity-75"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}

      {/* Main buddy body */}
      <div
        className={`w-full h-full bg-gradient-to-b ${getBuddyColor()} relative transition-all duration-500`}
        style={{
          borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
          transform: currentAnimation === "dancing" ? "rotate(5deg)" : "rotate(0deg)",
        }}
      >
        {/* Water level indicator */}
        <div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-blue-300 transition-all duration-1000"
          style={{
            height: `${waterLevel}%`,
            borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
          }}
        />

        {/* Shine effects */}
        <div className="absolute top-2 left-2 w-3 h-3 bg-white/50 rounded-full blur-sm animate-pulse"></div>
        <div className="absolute top-4 right-3 w-2 h-2 bg-yellow-200/60 rounded-full blur-sm"></div>

        {/* Ripple effect for celebrating */}
        {activity === "celebrating" && (
          <div className="absolute inset-0 border-2 border-yellow-300/50 rounded-full animate-ping"></div>
        )}

        {/* Face */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          {/* Eyes with blinking animation */}
          <div className="flex space-x-2 mb-1">
            <div className={`w-2 h-2 bg-white rounded-full ${expression === "wink" ? "animate-pulse" : ""}`}></div>
            <div className={`w-2 h-2 bg-white rounded-full ${expression === "sleepy" ? "opacity-50" : ""}`}></div>
          </div>

          {/* Expression */}
          <div className={`text-sm transition-all duration-300 ${activity === "dancing" ? "animate-bounce" : ""}`}>
            {expressions[expression]}
          </div>
        </div>

        {/* Animated arms */}
        <div
          className={`absolute -left-2 top-1/2 w-4 h-1 bg-blue-400 rounded-full transition-transform duration-500 ${
            currentAnimation === "dancing" ? "rotate-45" : "-rotate-45"
          }`}
        ></div>
        <div
          className={`absolute -right-2 top-1/2 w-4 h-1 bg-blue-400 rounded-full transition-transform duration-500 ${
            currentAnimation === "dancing" ? "-rotate-45" : "rotate-45"
          }`}
        ></div>

        {/* Animated legs */}
        <div
          className={`absolute -bottom-1 left-1/3 w-1 h-3 bg-blue-400 rounded-full transition-transform duration-300 ${
            currentAnimation === "jumping" ? "scale-y-75" : "scale-y-100"
          }`}
        ></div>
        <div
          className={`absolute -bottom-1 right-1/3 w-1 h-3 bg-blue-400 rounded-full transition-transform duration-300 ${
            currentAnimation === "jumping" ? "scale-y-75" : "scale-y-100"
          }`}
        ></div>
      </div>

      {/* Floating water drops */}
      <div className="absolute -top-6 left-4 animate-ping">
        <div className="w-2 h-2 bg-blue-300 rounded-full opacity-75"></div>
      </div>
      <div className="absolute -top-8 right-2 animate-ping delay-300">
        <div className="w-1 h-1 bg-yellow-300 rounded-full opacity-75"></div>
      </div>
      <div className="absolute -top-4 right-6 animate-ping delay-700">
        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full opacity-60"></div>
      </div>

      {/* Speech bubble for special activities */}
      {(activity === "celebrating" || expression === "excited") && (
        <div className="absolute -top-8 -right-4 bg-white/90 text-blue-600 text-xs px-2 py-1 rounded-lg animate-bounce">
          Great job! 🎉
        </div>
      )}
    </div>
  )
}
